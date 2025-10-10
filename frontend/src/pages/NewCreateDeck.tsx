import {ChangeEvent, useRef, useState} from "react"
import "../css/addFile.css"
import {useCreateDeck} from "../hooks/useCreateDeck"

import {
  FileAudio,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type FileWithProgress = {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
}

export default function CreateDeck() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deckName, setDeckName] = useState<string>("")
  const {createDeckMutation} = useCreateDeck();

  const inputRef = useRef<HTMLInputElement >(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      id: file.name,
    }));
    setFiles([...files, ...newFiles]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (files.length === 0 || uploading) {
      return;
    }

    const formData = new FormData();
    formData.append('deck_name', deckName)

    files.forEach((fileWithProgress) => {
      formData.append('files', fileWithProgress.file);
    });

    createDeckMutation.mutate(formData)
  }

  function removeFile(id: string) {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  }

  function handleClear() {
    setFiles([]);
  }

  const changeDeckName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckName(e.target.value)
  }

  return (
    <div className="file-upload-container">
      <h2 className="file-upload-header">Create Your Own Deck</h2>
      <div className="deck-name-input">
        <label className="deck-name-label"> Deck Name: </label>
        <input 
          type="text"
          value={deckName}
          onChange={changeDeckName}
          className="deck-name-input"
          placeholder="Enter Deck Name..."
        />
      </div>
      <div className="file-actions">
        <FileInput
          inputRef={inputRef}
          disabled={uploading}
          onFileSelect={handleFileSelect}
        />
        <ActionButtons
          disabled={files.length === 0 || uploading}
          onUpload={handleUpload}
          onClear={handleClear}
        />
      </div>
      <FileList files={files} onRemove={removeFile} uploading={uploading} />
    </div>
  );
}



type FileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

function FileInput({ inputRef, disabled, onFileSelect }: FileInputProps) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        className="file-input-hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label htmlFor="file-upload" className="select-files-label">
        <Plus size={18} />
        Select Files
      </label>
    </>
  );
}

type ActionButtonsProps = {
  disabled: boolean;
  onUpload: () => void;
  onClear: () => void;
};

function ActionButtons({ onUpload, onClear, disabled }: ActionButtonsProps) {
  return (
    <>
      <button onClick={onUpload} disabled={disabled} className="action-button">
        <Upload size={18} />
        Upload
      </button>
      <button onClick={onClear} className="action-button" disabled={disabled}>
        <Trash2 size={18} />
        Clear All
      </button>
    </>
  );
}

type FileListProps = {
  files: FileWithProgress[];
  onRemove: (id: string) => void;
  uploading: boolean;
};

function FileList({ files, onRemove, uploading }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-list-container">
      <h3 className="file-list-header">Files:</h3>
      <div className="files-grid">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={onRemove}
            uploading={uploading}
          />
        ))}
      </div>
    </div>
  );
}

function FileItem({ file, onRemove, uploading }: FileItemProps) {
  const Icon = getFileIcon(file.file.type);

  return (
    <div className="file-item">
      <div className="file-item-header">
        <div className="file-item-content">
          <Icon size={40} className="file-icon" />
          <div className="file-details">
            <span className="file-name">{file.file.name}</span>
            <div className="file-meta">
              <span>{formatFileSize(file.file.size)}</span>
              <span>•</span>
              <span>{file.file.type || 'Unknown type'}</span>
            </div>
          </div>
        </div>
        {!uploading && (
          <button onClick={() => onRemove(file.id)} className="remove-button">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="file-status">
        {file.uploaded ? 'Completed' : `${Math.round(file.progress)}%`}
      </div>
      <ProgressBar progress={file.progress} />
    </div>
  );
}

type FileItemProps = {
  file: FileWithProgress;
  onRemove: (id: string) => void;
  uploading: boolean;
};

type ProgressBarProps = {
  progress: number;
};

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType === 'application/pdf') return FileText;
  return FileIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
