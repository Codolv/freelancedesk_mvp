'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FileVersion {
  id: string;
  project_file_id: string;
  version_number: number;
  file_path: string;
  size_bytes?: number;
  mime_type?: string;
  created_at: string;
  created_by: string;
  createdBy: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function TestVersionsPage() {
  const [projectId, setProjectId] = useState('');
  const [fileName, setFileName] = useState('');
 const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testVersioning = async () => {
    if (!projectId || !fileName) {
      setMessage('Please enter both Project ID and File Name');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/files/${projectId}/${fileName}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
        setMessage(`Found ${data.versions?.length || 0} versions`);
      } else {
        setMessage('Error fetching versions');
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>File Versioning Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project ID</label>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Enter project ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File Name</label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                />
              </div>
            </div>
            
            <Button onClick={testVersioning} disabled={loading}>
              {loading ? 'Loading...' : 'Test Versioning API'}
            </Button>
            
            {message && (
              <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {message}
              </div>
            )}

            {versions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Version History</h3>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div key={version.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Version {version.version_number}</span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(version.created_at).toLocaleString()}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            Size: {version.size_bytes} bytes
                          </span>
                        </div>
                        <a
                          href={`/api/files/${projectId}/${fileName}/versions/${version.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
