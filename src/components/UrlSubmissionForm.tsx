import { useState } from "react";
import { Link } from "lucide-react";
import { useCreateDomainMutation } from "../lib/queries";

interface UrlSubmissionFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function UrlSubmissionForm({ onSuccess, onError }: UrlSubmissionFormProps) {
  const [url, setUrl] = useState("");
  const createDomainMutation = useCreateDomainMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      try {
        await createDomainMutation.mutateAsync({
          url: url.trim(),
          status: "pending",
        });
        setUrl("");
        onSuccess("URL submitted successfully!");
      } catch (error) {
        onError("Failed to submit URL");
      }
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 sticky top-8">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-6 mx-auto">
          <Link className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
          Submit URLs
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Add a URL to the list and track its processing status
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={createDomainMutation.isPending}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={createDomainMutation.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {createDomainMutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UrlSubmissionForm;
