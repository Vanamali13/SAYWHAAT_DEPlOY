import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Camera, Video, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function ProofGallery({ proofs }) {
  const [selectedProof, setSelectedProof] = useState(null);

  if (!proofs || proofs.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-12 text-center">
          <Camera className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No delivery proofs uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Delivery Proofs ({proofs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {proofs.map((proof) => (
              <div
                key={proof.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedProof(proof)}
              >
                {proof.proof_type === "photo" ? (
                  <img
                    src={proof.file_url}
                    alt="Delivery proof"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Video className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                {proof.is_selected && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 border-yellow-600 text-white">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Best Quality
                  </Badge>
                )}

                {proof.quality_score && (
                  <Badge variant="outline" className="absolute bottom-2 left-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700">
                    Score: {proof.quality_score}
                  </Badge>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="max-w-4xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Delivery Proof</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-4">
              {selectedProof.proof_type === "photo" ? (
                <img
                  src={selectedProof.file_url}
                  alt="Delivery proof"
                  className="w-full rounded-lg"
                />
              ) : (
                <video
                  src={selectedProof.file_url}
                  controls
                  className="w-full rounded-lg"
                />
              )}
              {selectedProof.upload_notes && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedProof.upload_notes}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}