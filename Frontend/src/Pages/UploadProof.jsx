import React, { useState } from "react";
import apiClient from "../api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Select, SelectItem } from "../Components/ui/select";
import { Upload, Camera, Loader2, CheckCircle, Package } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function UploadProof() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBatch, setSelectedBatch] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch Assigned Batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['myBatches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/batches/my-batches');
      // Filter primarily for batches that actully need proof (e.g., in_transit or assigned)
      // Showing all for flexibility, or maybe filter out 'delivered'?
      // Let's show all but maybe sort or indicate status.
      return data.filter(b => b.status !== 'delivered');
    },
    initialData: []
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (formData) => {
      // Helper to upload files one by one or batch if endpoint supports it.
      // Our backend /api/upload supports 'files' array.
      const { data } = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data.files; // Array of URLs
    }
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ batchId, data }) => {
      const { data: result } = await apiClient.patch(`/batches/${batchId}/status`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBatches'] });
      addToast("Proofs uploaded successfully! Batch marked as Delivered.", "success");
      setSelectedBatch("");
      setUploadNotes("");
      setFiles([]);
    },
    onError: (err) => {
      console.error(err);
      addToast("Failed to update batch status.", "error");
    }
  });

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!selectedBatch || files.length === 0) {
      addToast("Please select a batch and upload at least one file", "warning");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload Files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const fileUrls = await uploadFilesMutation.mutateAsync(formData);

      // 2. Update Batch
      await updateBatchMutation.mutateAsync({
        batchId: selectedBatch,
        data: {
          status: 'delivered',
          notes: uploadNotes,
          proofs: fileUrls
        }
      });

    } catch (error) {
      addToast("Error uploading proofs. Please try again.", "error");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            Upload Delivery Proof
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Document successful batch deliveries</p>
        </div>

        <Card className="backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-zinc-900 dark:text-white">
              <Camera className="w-6 h-6 text-blue-600 dark:text-white" />
              Batch Proof Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="batch" className="text-zinc-900 dark:text-white">Select Batch *</Label>
              <Select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                placeholder={batchesLoading ? "Loading assigned batches..." : "Choose a batch to deliver"}
                disabled={batchesLoading}
              >
                {batches.map(batch => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.batchId} - {batch.items ? batch.items.length : 0} Items ({batch.status})
                  </SelectItem>
                ))}
              </Select>
              {batches.length === 0 && !batchesLoading && (
                <p className="text-xs text-yellow-600 mt-1">No pending batches found.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="files" className="text-zinc-900 dark:text-white">Upload Photos/Videos *</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="cursor-pointer bg-zinc-50 dark:bg-zinc-950"
              />
              {files.length > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-zinc-900 dark:text-white">Delivery Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the delivery..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={4}
                className="bg-zinc-50 dark:bg-zinc-950"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedBatch || files.length === 0}
              className="w-full px-6 py-3 text-white bg-zinc-900 hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-3" />
                  Mark as Delivered & Upload Proof
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
