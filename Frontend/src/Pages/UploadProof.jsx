
import React, { useState } from "react";
import base44 from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Select, SelectItem } from "../Components/ui/select";
import { Upload, Camera, Loader2, CheckCircle } from "lucide-react";

export default function UploadProof() {
  const queryClient = useQueryClient();
  const [selectedDonation, setSelectedDonation] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: donations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ['donations-for-proof'],
    queryFn: () => base44.entities.Donation.filter({ status: "in_transit" }, '-created_date'),
    initialData: []
  });

  const { data: receivers = [], isLoading: receiversLoading } = useQuery({
    queryKey: ['receivers'],
    queryFn: () => base44.entities.Receiver.list(),
    initialData: []
  });

  const updateDonationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Donation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });

  const sendProofEmailMutation = useMutation({
    mutationFn: async ({ donation, bestProofs, receiver }) => {
      const proofImagesHtml = bestProofs.map(proof =>
        `<div style="margin-bottom: 10px;">
           <img src="${proof.file_url}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px;" />
           <p style="text-align: center; font-size: 12px; color: #555; margin-top: 5px;">Quality Score: ${proof.quality_score || 'N/A'}</p>
         </div>`
      ).join('');

      const emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0056b3;">Donation Delivery Confirmation</h2>
          <p>Dear Donor,</p>
          <p>Your donation has been successfully delivered! Thank you for your generous contribution. Here are the details and photo proofs of the delivery:</p>
          
          <h3 style="color: #0056b3;">Donation Details:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 5px;"><strong>Donor ID:</strong> ${donation.donor_id}</li>
            <li style="margin-bottom: 5px;"><strong>Donation Type:</strong> ${donation.donation_type}</li>
            <li style="margin-bottom: 5px;"><strong>Amount:</strong> ${donation.amount ? '$' + donation.amount.toFixed(2) : 'N/A'}</li>
            <li style="margin-bottom: 5px;"><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>

          <h3 style="color: #0056b3;">Receiver Details:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 5px;"><strong>Name:</strong> ${receiver.full_name}</li>
            <li style="margin-bottom: 5px;"><strong>Location:</strong> ${receiver.address}</li>
          </ul>

          <h3 style="color: #0056b3;">Delivery Proofs:</h3>
          <p>Here are the best available proofs from the delivery:</p>
          <div style="margin-top: 15px;">
            ${proofImagesHtml}
          </div>

          <p style="margin-top: 20px;">Thank you for your generous contribution and for bringing a smile to someone's face!</p>
          <p>With gratitude,<br/>The Say Whatt Team</p>
        </div>
      `;

      return await base44.integrations.Core.SendEmail({
        from_name: "Say Whatt Platform",
        to: donation.donor_email,
        subject: `Delivery Confirmed for Donation to ${receiver.full_name} (ID: ${donation.id.slice(-6)})`,
        body: emailBody
      });
    }
  });

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const analyzeImageQuality = async (fileUrl) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this delivery proof image and rate its quality from 0-100 based on:
        1. Clarity and sharpness (40 points)
        2. Proper lighting (20 points)
        3. Shows people receiving donation clearly (20 points)
        4. No blur or obstruction (20 points)
        Return only a number between 0-100.`,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" }
          }
        }
      });
      return result.score || 70;
    } catch {
      return 70;
    }
  };

  const handleUpload = async () => {
    if (!selectedDonation || files.length === 0) {
      alert("Please select a donation and upload at least one file");
      return;
    }

    setUploading(true);

    try {
      const donation = donations.find(d => d.id === selectedDonation);
      if (!donation) {
        alert("Error: Could not find the selected donation details. Please refresh and try again.");
        setUploading(false);
        return;
      }
      const receiver = receivers.find(r => r.id === donation.receiver_id);
      if (!receiver) {
        alert("Error: Could not find the receiver details for this donation. Please refresh and try again.");
        setUploading(false);
        return;
      }

      const user = await base44.auth.me();

      const uploadedProofs = [];

      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const isVideo = file.type.startsWith('video/');
        const qualityScore = isVideo ? 80 : await analyzeImageQuality(file_url);

        const proof = await base44.entities.DonationProof.create({
          donation_id: selectedDonation,
          file_url,
          proof_type: isVideo ? 'video' : 'photo',
          quality_score: qualityScore,
          uploaded_by: user.email,
          upload_notes: uploadNotes,
          is_selected: false
        });

        uploadedProofs.push(proof);
      }

      // Select top 3 proofs
      const bestProofs = uploadedProofs
        .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
        .slice(0, 3);

      // Mark top proofs as selected
      for (const proof of bestProofs) {
        await base44.entities.DonationProof.update(proof.id, { is_selected: true });
      }

      await updateDonationMutation.mutateAsync({
        id: selectedDonation,
        data: {
          status: 'delivered',
          actual_delivery: new Date().toISOString()
        }
      });

      await sendProofEmailMutation.mutateAsync({
        donation,
        bestProofs, // Pass top proofs to email function
        receiver
      });

      await updateDonationMutation.mutateAsync({
        id: selectedDonation,
        data: { proof_sent: true, status: 'confirmed' }
      });

      alert("Proofs uploaded successfully and email sent to donor!");
      setSelectedDonation("");
      setUploadNotes("");
      setFiles([]);
    } catch (error) {
      alert("Error uploading proofs. Please try again.");
      console.error(error);
    }

    setUploading(false);
  };

  const isLoading = donationsLoading || receiversLoading;

  return (
    <div className="min-h-screen p-6 bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Upload Delivery Proof
          </h1>
          <p className="text-gray-600 mt-2">Document successful donation deliveries</p>
        </div>

        <Card className="backdrop-blur-sm bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Camera className="w-6 h-6 text-white" />
              Proof Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="donation">Select Donation *</Label>
              <Select
                value={selectedDonation}
                onChange={e => setSelectedDonation(e.target.value)}
                placeholder={isLoading ? "Loading donations..." : "Choose a donation in transit"}
                disabled={isLoading}
              >
                {donations.map(donation => {
                  const receiver = receivers.find(r => r.id === donation.receiver_id);
                  return (
                    <SelectItem key={donation.id} value={donation.id}>
                      {`Donation to ${receiver?.full_name || 'Unknown'} (${donation.donation_type})`}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Upload Photos/Videos *</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
              {files.length > 0 && (
                <p className="text-sm text-zinc-400">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Upload Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the delivery..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedDonation || files.length === 0}
              className="w-full px-6 py-3 text-black bg-white hover:bg-zinc-200"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Uploading & Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-3" />
                  Upload Proof & Notify Donor
                </>
              )}
            </Button>

            <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-300">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                The system will automatically analyze image quality and send the best 3 proofs to the donor via email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
