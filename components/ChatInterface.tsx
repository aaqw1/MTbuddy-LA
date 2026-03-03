'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUp, X, CheckCircle, ArrowRight, Wallet, Box, Download, FileText, AlertTriangle, PlayCircle, HardHat, Phone, Plus, Video, Lock, Hammer, Zap, Droplets, ShieldCheck, Clock, ListChecks, Calendar, Image as ImageIcon, CheckSquare, Layers, FileWarning, Eye, EyeOff, ScanLine, Workflow, PenTool, DraftingCompass, ExternalLink, Maximize2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, DesignOption, PreviewCard, SurgeryReport, ProductItem, IntakeData } from '../types';
import { generatePreviews, generateDesignDetail, generateSurgeryDetail, generateBlueprint, generateVirtualTour } from '../services/apiClient';
import { jsPDF } from 'jspdf';
import IntakeWizard from './IntakeWizard';
import ConsultModal from './ConsultModal';

interface EnhancedMessage extends Message {
  previews?: PreviewCard[];
  detail?: DesignOption | SurgeryReport;
  detailType?: 'design' | 'surgery';
  // New field to support inline video messages
  video?: {
    url: string;
    title: string;
  };
}

interface AttachedFile {
  name: string;
  data: string; // Base64
  mimeType: string;
  previewUrl?: string; // Blob URL for preview
}

const guessMimeType = (file: File): string => {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'mov') return 'video/quicktime';
  if (['mp4', 'm4v'].includes(ext || '')) return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (['jpg', 'jpeg'].includes(ext || '')) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // File State
  const [selectedFiles, setSelectedFiles] = useState<AttachedFile[]>([]);
  const [sessionFiles, setSessionFiles] = useState<AttachedFile[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Data State
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [showWizard, setShowWizard] = useState(true);

  // Loading state for details
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Consult Modal
  const [showConsult, setShowConsult] = useState(false);
  const [activeDetailForConsult, setActiveDetailForConsult] = useState<DesignOption | null>(null);

  // Blueprint Modal
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [selectedBlueprintUrl, setSelectedBlueprintUrl] = useState<string | null>(null);
  const [selectedBlueprintTitle, setSelectedBlueprintTitle] = useState<string>("");

  // Video Modal State REMOVED - Videos now appear in chat

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractFrameFromVideo = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const url = URL.createObjectURL(file);
      video.src = url;

      let resolved = false;
      const safeResolve = (val: string) => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          resolve(val);
        }
      };

      const timeout = setTimeout(() => safeResolve(''), 10000);

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 0) * 0.1);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            clearTimeout(timeout);
            safeResolve(dataUrl.split(',')[1]);
          } catch (e) {
            console.error("Frame capture error", e);
            clearTimeout(timeout);
            safeResolve('');
          }
        } else {
          clearTimeout(timeout);
          safeResolve('');
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        safeResolve('');
      };
    });
  };

  const handleIntakeComplete = async (data: IntakeData, files: File[], userMessage?: string) => {
    setIntakeData(data);
    setShowWizard(false);

    let processedFiles: AttachedFile[] = [];
    let computedRefImage = referenceImage; // use current state as default

    if (files.length > 0) {
      setIsProcessingFiles(true);
      try {
        const originalProcessed = await Promise.all(files.map(async (file) => ({
          name: file.name,
          mimeType: guessMimeType(file),
          data: await fileToBase64(file),
          previewUrl: URL.createObjectURL(file)
        })));

        processedFiles = [...originalProcessed];

        const videoFileObj = files.find(f => guessMimeType(f).startsWith('video/'));
        if (videoFileObj) {
          const frame = await extractFrameFromVideo(videoFileObj);
          if (frame) {
            setReferenceImage(frame);
            computedRefImage = frame;

            // Add keyframe as separate file
            processedFiles.push({
              name: `${videoFileObj.name}-keyframe.jpg`,
              mimeType: 'image/jpeg',
              data: frame,
              previewUrl: `data:image/jpeg;base64,${frame}`
            });
          }
        } else if (processedFiles.length > 0 && processedFiles[0].mimeType.startsWith('image/')) {
          setReferenceImage(processedFiles[0].data);
          computedRefImage = processedFiles[0].data;
        }

        setSessionFiles(prev => [...prev, ...processedFiles]);
      } catch (e) {
        console.error("Intake file error", e);
      } finally {
        setIsProcessingFiles(false);
      }
    }

    // Trigger generation immediately
    setTimeout(() => {
      handleSubmit(undefined, userMessage, processedFiles, data, computedRefImage);
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        setIsProcessingFiles(true);
        const newFiles = Array.from(e.target.files) as File[];

        // Check for file size limit (prevent crash on large videos)
        const MAX_SIZE_MB = 25;
        const oversized = newFiles.find(f => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (oversized) {
          alert(`File "${oversized.name}" is too large (${(oversized.size / 1024 / 1024).toFixed(1)}MB). Please upload files smaller than ${MAX_SIZE_MB}MB.`);
          setIsProcessingFiles(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const originalProcessed = await Promise.all(newFiles.map(async (file) => ({
          name: file.name,
          mimeType: guessMimeType(file),
          data: await fileToBase64(file),
          previewUrl: URL.createObjectURL(file)
        })));

        let finalProcessed = [...originalProcessed];

        const videoFileObj = newFiles.find(f => guessMimeType(f).startsWith('video/'));
        if (videoFileObj) {
          const frameBase64 = await extractFrameFromVideo(videoFileObj);
          if (frameBase64) {
            if (!referenceImage) setReferenceImage(frameBase64);

            finalProcessed.push({
              name: `${videoFileObj.name}-keyframe.jpg`,
              mimeType: 'image/jpeg',
              data: frameBase64,
              previewUrl: `data:image/jpeg;base64,${frameBase64}`
            });
          }
        } else if (!referenceImage && finalProcessed.length > 0 && finalProcessed[0].mimeType.startsWith('image/')) {
          setReferenceImage(finalProcessed[0].data);
        }

        setSelectedFiles(prev => [...prev, ...finalProcessed]);
      }
    } catch (error) {
      console.error("Error selecting files:", error);
      alert("Failed to process file. It may be too large or corrupted.");
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (
    e?: React.FormEvent,
    overrideInput?: string,
    overrideFiles?: AttachedFile[],
    overrideIntake?: IntakeData,
    overrideRefImage?: string | null
  ) => {
    if (e) e.preventDefault();

    const effectiveInput = overrideInput !== undefined ? overrideInput : input;
    const effectiveFiles = overrideFiles !== undefined ? overrideFiles : selectedFiles;
    const effectiveIntake = overrideIntake !== undefined ? overrideIntake : intakeData;
    const effectiveRefImage = overrideRefImage !== undefined ? overrideRefImage : referenceImage;

    if ((!effectiveInput.trim() && effectiveFiles.length === 0) || loading || isProcessingFiles) return;

    const userQuery = effectiveInput.trim() || "Analyze my bathroom scope.";

    if (effectiveFiles.length > 0 && !overrideFiles) {
      // If not calling via override (which means standard chat input), add to session
      setSessionFiles(prev => [...prev, ...effectiveFiles]);
    }
    // If overrideFiles is present, they were already added to session in handleIntakeComplete

    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);

    const currentBatchFiles = effectiveFiles.length > 0 ? effectiveFiles : sessionFiles;

    // Filter out unsupported videos (e.g. MOV) for inlineData, rely on the extracted keyframes instead
    const mediaParts = currentBatchFiles
      .filter(f => {
        if (f.mimeType.startsWith('image/')) return true;
        if (f.mimeType === 'application/pdf') return true;
        if (f.mimeType === 'video/mp4' || f.mimeType === 'video/webm') return true;
        return false;
      })
      .map(f => ({
        inlineData: {
          data: f.data,
          mimeType: f.mimeType
        }
      }));

    setInput('');
    setSelectedFiles([]);
    setLoading(true);

    try {
      const previews = await generatePreviews(userQuery, effectiveIntake || undefined, mediaParts, effectiveRefImage || undefined);
      setMessages(prev => [...prev, { role: 'assistant', content: "I've analyzed your actual space. Here are 3 design directions and 1 plumbing analysis based on your video.", previews }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlueprint = async (card: PreviewCard, messageIndex: number, cardIndex: number) => {
    if (card.blueprint_status === 'generating') return;

    if (card.blueprint_url) {
      setSelectedBlueprintUrl(card.blueprint_url);
      setSelectedBlueprintTitle(card.title);
      setBlueprintModalOpen(true);
      return;
    }

    if (!card.image_url) {
      alert("Wait for the design image to load first.");
      return;
    }

    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
        newMsgs[messageIndex].previews![cardIndex].blueprint_status = 'generating';
      }
      return newMsgs;
    });

    try {
      const blueprintUrl = await generateBlueprint(card.image_url);

      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
          newMsgs[messageIndex].previews![cardIndex].blueprint_url = blueprintUrl || undefined;
          newMsgs[messageIndex].previews![cardIndex].blueprint_status = blueprintUrl ? 'done' : 'error';
        }
        return newMsgs;
      });

      if (blueprintUrl) {
        setSelectedBlueprintUrl(blueprintUrl);
        setSelectedBlueprintTitle(card.title);
        setBlueprintModalOpen(true);
      }
    } catch (e) {
      console.error("Blueprint Error", e);
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
          newMsgs[messageIndex].previews![cardIndex].blueprint_status = 'error';
        }
        return newMsgs;
      });
    }
  };

  const handleGenerateVideo = async (card: PreviewCard, messageIndex: number, cardIndex: number) => {
    if (card.video_status === 'generating') return;

    // Check if API Key is set via AI Studio (Veo specific)
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      try {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
          await new Promise(r => setTimeout(r, 1000));
          if (!(await win.aistudio.hasSelectedApiKey())) {
            alert("API Key selection is required for video generation.");
            return;
          }
        }
      } catch (e) {
        console.error("API Key Check failed", e);
      }
    }

    // If video exists, just show it in chat
    if (card.video_url) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Here is the generated virtual tour for **${card.title}**:`,
        video: {
          url: card.video_url!,
          title: card.title
        }
      }]);
      return;
    }

    if (!card.image_url) {
      alert("Wait for the design image to load first.");
      return;
    }

    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
        newMsgs[messageIndex].previews![cardIndex].video_status = 'generating';
      }
      return newMsgs;
    });

    try {
      const videoUri = await generateVirtualTour(card.image_url);

      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
          newMsgs[messageIndex].previews![cardIndex].video_url = videoUri || undefined;
          newMsgs[messageIndex].previews![cardIndex].video_status = videoUri ? 'done' : 'error';
        }
        // If success, append new message with video
        if (videoUri) {
          return [...newMsgs, {
            role: 'assistant',
            content: `Here is the generated virtual tour for **${card.title}**:`,
            video: {
              url: videoUri,
              title: card.title
            }
          }];
        }
        return newMsgs;
      });

    } catch (e) {
      console.error("Video Error", e);
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[messageIndex] && newMsgs[messageIndex].previews) {
          newMsgs[messageIndex].previews![cardIndex].video_status = 'error';
        }
        return newMsgs;
      });
    }
  };

  const handleGenerateBlueprintForDetail = async (messageIndex: number) => {
    const msg = messages[messageIndex];
    if (!msg.detail || msg.detailType !== 'design') return;
    const opt = msg.detail as DesignOption;

    if (opt.blueprint_status === 'generating') return;
    if (opt.blueprint_url) {
      setSelectedBlueprintUrl(opt.blueprint_url);
      setSelectedBlueprintTitle(opt.title);
      setBlueprintModalOpen(true);
      return;
    }

    setMessages(prev => {
      const newMsgs = [...prev];
      const d = newMsgs[messageIndex].detail as DesignOption;
      newMsgs[messageIndex].detail = { ...d, blueprint_status: 'generating' };
      return newMsgs;
    });

    try {
      const blueprintUrl = await generateBlueprint(opt.image_url || '');

      setMessages(prev => {
        const newMsgs = [...prev];
        const d = newMsgs[messageIndex].detail as DesignOption;
        newMsgs[messageIndex].detail = {
          ...d,
          blueprint_url: blueprintUrl || undefined,
          blueprint_status: blueprintUrl ? 'done' : 'error'
        };
        return newMsgs;
      });

      if (blueprintUrl) {
        setSelectedBlueprintUrl(blueprintUrl);
        setSelectedBlueprintTitle(opt.title);
        setBlueprintModalOpen(true);
      }

    } catch (e) {
      console.error("Blueprint Gen Error", e);
      setMessages(prev => {
        const newMsgs = [...prev];
        const d = newMsgs[messageIndex].detail as DesignOption;
        newMsgs[messageIndex].detail = { ...d, blueprint_status: 'error' };
        return newMsgs;
      });
    }
  };

  const handleCardClick = async (card: PreviewCard) => {
    if (loadingDetailId) return;
    setLoadingDetailId(card.id);

    try {
      let detail: DesignOption | SurgeryReport | null = null;

      const mediaParts = sessionFiles.map(f => ({
        inlineData: {
          data: f.data,
          mimeType: f.mimeType
        }
      }));

      if (card.type === 'surgery') {
        detail = await generateSurgeryDetail(card.title, intakeData || undefined, mediaParts, referenceImage || undefined);
      } else {
        detail = await generateDesignDetail(card.style!, card.title, intakeData || undefined, mediaParts, referenceImage || undefined, card.image_url);
      }

      if (detail) {
        const mergedDetail = {
          ...card,
          ...detail,
          image_url: card.type === 'design' ? card.image_url : detail.image_url
        };

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: card.type === 'surgery'
            ? `Here is the plumbing analysis of your existing conditions.`
            : `Here is the detailed architectural roadmap for the ${card.title}.`,
          detail: mergedDetail,
          detailType: card.type
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an issue generating the full details. Please try again." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error generating details. Please try again." }]);
    } finally {
      setLoadingDetailId(null);
    }
  };

  // --- PDF Generation Logic (Extracted) ---
  const generatePdfDocument = (detail: DesignOption | SurgeryReport, type: 'design' | 'surgery'): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(type === 'design' ? "Design Roadmap" : "Plumbing Analysis", margin, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`LA RenoBuddy • ${detail.title}`, margin, 32);

    y = 55;
    doc.setTextColor(0, 0, 0);

    if (type === 'design') {
      const opt = detail as DesignOption;
      if (opt.image_url) {
        checkPageBreak(contentWidth * 0.75 + 10);
        try {
          const imgH = contentWidth * 0.75;
          doc.addImage(opt.image_url, 'PNG', margin, y, contentWidth, imgH);
          y += imgH + 10;
        } catch (e) {
          console.error("PDF Image Add Error", e);
        }
      }

      if (intakeData) {
        checkPageBreak(30);
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 25, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Project Context (Inputs Captured):", margin + 5, y + 6);
        y += 10;
        doc.setFont("helvetica", "normal");
        const inputs = [
          `Residence: ${intakeData.residentialType}`,
          `Construction: ${intakeData.isNewBathroom}`,
          `Layout Change: ${intakeData.isLayoutChange}`,
          `Structural: ${intakeData.isRemovingWalls}`
        ];
        inputs.forEach((inp, i) => {
          if (i === 2) y += 5;
          const x = i % 2 === 0 ? margin + 5 : margin + 90;
          const yPos = i < 2 ? y : y;
          doc.text(`• ${inp}`, x, yPos);
        });
        y += 20;
      }

      if (opt.permit_path_info) {
        checkPageBreak(50);
        if (opt.permit_path_info.type.includes('Express')) {
          doc.setFillColor(236, 253, 245);
          doc.setDrawColor(167, 243, 208);
          doc.setTextColor(6, 95, 70);
        } else {
          doc.setFillColor(255, 251, 235);
          doc.setDrawColor(253, 230, 138);
          doc.setTextColor(146, 64, 14);
        }
        doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'FD');
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Permit Strategy: ${opt.permit_path_info.type}`, margin + 5, y + 10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(opt.permit_path_info.summary, contentWidth - 10);
        doc.text(summaryLines, margin + 5, y + 18);
        if (opt.permit_path_info.citations && opt.permit_path_info.citations.length > 0) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text(`Sources: ${opt.permit_path_info.citations.join(', ')}`, margin + 5, y + 30);
        }
        doc.setTextColor(0);
        y += 45;
      }

      if (opt.project_timeline && opt.project_timeline.length > 0) {
        checkPageBreak(60);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Execution Timeline", margin, y);
        y += 8;
        opt.project_timeline.forEach((phase, i) => {
          checkPageBreak(15);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.line(margin + 6, y, margin + 6, y + 12);
          doc.setFillColor(241, 245, 249);
          doc.circle(margin + 6, y + 2, 3, 'F');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(`${i + 1}`, margin + 5, y + 3);
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.setFont("helvetica", "bold");
          doc.text(phase.phase, margin + 15, y + 2);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(100);
          const descText = doc.splitTextToSize(`${phase.duration} • ${phase.description}`, contentWidth - 20);
          doc.text(descText, margin + 15, y + 7);
          doc.setTextColor(0);
          y += 7 + (descText.length * 4) + 5;
        });
        y += 10;
      }

      if (opt.visual_comparisons && opt.visual_comparisons.length > 0) {
        checkPageBreak(80);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Transformation Analysis", margin, y);
        y += 8;
        const imgW = (contentWidth / 2) - 2;
        const imgH = (imgW * 3) / 4;
        if (referenceImage) {
          try {
            doc.addImage(`data:image/jpeg;base64,${referenceImage}`, 'JPEG', margin, y, imgW, imgH);
            doc.setFontSize(8);
            doc.text("Original Condition", margin, y + imgH + 4);
          } catch (e) { }
        }
        if (opt.image_url) {
          try {
            doc.addImage(opt.image_url, 'PNG', margin + imgW + 4, y, imgW, imgH);
            doc.setFontSize(8);
            doc.text("Proposed Design", margin + imgW + 4, y + imgH + 4);
          } catch (e) { }
        }
        y += imgH + 10;
        opt.visual_comparisons.forEach(vc => {
          vc.modifications.forEach(mod => {
            checkPageBreak(15);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`${mod.area}:`, margin, y);
            doc.setFont("helvetica", "normal");
            const modText = doc.splitTextToSize(`${mod.change} -> ${mod.permit_impact}`, contentWidth - 40);
            doc.text(modText, margin + 35, y);
            y += (modText.length * 5) + 3;
          });
        });
        y += 10;
      }

      checkPageBreak(60);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Estimated Cost Range", margin + 5, y + 6);
      y += 15;
      if (opt.cost_breakdown) {
        const cats = ['materials', 'labor', 'fixtures', 'permits'] as const;
        cats.forEach(cat => {
          const item = opt.cost_breakdown[cat];
          if (item) {
            checkPageBreak(15);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(cat.toUpperCase(), margin, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${item.low} - ${item.high}`, margin + 40, y);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Driver: ${item.drivers}`, margin + 40, y + 4);
            doc.setTextColor(0);
            y += 10;
          }
        });
        y += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Estimate: ${opt.cost_breakdown.total_range}`, margin, y);
        y += 15;
      }

      if (opt.permit_readiness_pack && opt.permit_readiness_pack.length > 0) {
        checkPageBreak(60);
        doc.setFillColor(240, 249, 255);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Required Plan Sheets", margin + 5, y + 6);
        y += 15;
        opt.permit_readiness_pack.forEach(item => {
          checkPageBreak(25);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(item.item, margin, y);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80);
          const detailsText = doc.splitTextToSize(item.details, contentWidth - 5);
          doc.text(detailsText, margin + 5, y + 5);
          doc.setTextColor(0);
          y += 5 + (detailsText.length * 4) + 5;
        });
      }
    } else {
      const rep = detail as SurgeryReport;
      checkPageBreak(60);
      doc.setFillColor(254, 242, 242);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text("Executive Summary: Top 3 Actions", margin + 5, y + 6);
      doc.setTextColor(0);
      y += 15;
      rep.executive_summary?.forEach((action, i) => {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${action.action}`, margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80);
        const subtext = doc.splitTextToSize(`Who: ${action.who} • Time: ${action.time_estimate} • Tools: ${action.tools}`, contentWidth);
        doc.text(subtext, margin + 5, y);
        doc.setTextColor(0);
        y += (subtext.length * 4) + 6;
      });
      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("MEP Digital Twin Findings", margin, y);
      y += 10;
      rep.keyframes?.forEach((kf) => {
        checkPageBreak(120);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`View: ${kf.title}`, margin, y);
        y += 8;
        if (kf.image_url && kf.image_url.startsWith('data:image')) {
          try {
            const imgW = contentWidth * 0.7;
            const imgH = (imgW * 9) / 16;
            doc.addImage(kf.image_url, 'PNG', margin, y, imgW, imgH);
            y += imgH + 10;
          } catch (e) { }
        }
        kf.annotations.forEach(note => {
          checkPageBreak(30);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`${note.object_name} [${note.risk_level}]`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const actionLine = `Action: ${note.action} (${note.who}) • Permit Impact: ${note.permit_impact}`;
          const actionText = doc.splitTextToSize(actionLine, contentWidth);
          doc.text(actionText, margin, y + 5);
          const noteText = doc.splitTextToSize(note.notes, contentWidth);
          doc.text(noteText, margin, y + 5 + (actionText.length * 4));
          y += 10 + (actionText.length * 4) + (noteText.length * 4);
        });
        y += 10;
      });
    }

    return doc;
  };

  const handleDownloadPdf = (detail: DesignOption | SurgeryReport, type: 'design' | 'surgery') => {
    try {
      const doc = generatePdfDocument(detail, type);
      doc.save(`MTBuddy-${type}-${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("PDF Download Error", e);
      alert("Failed to download PDF.");
    }
  };

  const handleSendConsultRequest = (contactInfo: any) => {
    if (!activeDetailForConsult) return;

    // 1. Generate PDF Blob
    const doc = generatePdfDocument(activeDetailForConsult, 'design');
    const pdfDataUri = doc.output('datauristring');
    const pdfBlob = doc.output('blob');

    // 2. Prepare Payload (Simulation)
    const payload = {
      recipient: "mz2821@columbia.edu",
      contact: contactInfo,
      intake: intakeData,
      files: sessionFiles.map(f => ({ name: f.name, size: f.data.length })),
      designTitle: activeDetailForConsult.title,
      designStyle: activeDetailForConsult.style,
      pdfAttachmentSize: pdfBlob.size
    };

    console.log("🚀 SENDING EMAIL TO mz2821@columbia.edu", payload);

    // 3. Open Mailto as fallback/confirmation
    const subject = `Project Assessment Request: ${contactInfo.name}`;
    const body = `Name: ${contactInfo.name}
Email: ${contactInfo.email}
Phone: ${contactInfo.phone}

Project Scope:
- Residence: ${intakeData?.residentialType || 'N/A'}
- Layout: ${intakeData?.isLayoutChange || 'N/A'}
- Structural: ${intakeData?.isRemovingWalls || 'N/A'}

Attached Data:
1. Intake Video/Photos (Refer to System ID: ${Date.now()})
2. Design Mood Board PDF (${activeDetailForConsult.title})

Message:
${contactInfo.message}
`;

    setTimeout(() => {
      alert(`Request sent to mz2821@columbia.edu!
        
Sent Items:
1. User Contact & Message
2. Project Assessment (Intake + Video)
3. Mood Board PDF (${Math.round(pdfBlob.size / 1024)} KB)

We will review your video and plan shortly.`);

      window.location.href = `mailto:mz2821@columbia.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 500);
  };

  const renderDesignDetail = (opt: DesignOption, messageIndex: number) => (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="w-full relative group aspect-[4/3] bg-slate-100">
        <img src={opt.image_url} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-3 border border-white/30">
            {opt.style}
          </div>
          <h2 className="text-3xl font-serif">{opt.title}</h2>
        </div>
      </div>

      <div className="p-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">

          {/* INPUTS CAPTURED DASHBOARD */}
          {intakeData && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="font-bold text-slate-900">Inputs Captured:</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-100">{intakeData.residentialType}</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-100">{intakeData.isNewBathroom === 'New Area' ? 'New Build' : 'Renovation'}</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-100">{intakeData.isLayoutChange === 'Layout Change' ? 'Layout Change' : 'Same Layout'}</span>
            </div>
          )}

          {/* PERMIT PATH STRATEGY (NEW) */}
          {opt.permit_path_info && (
            <div className={`
                 relative overflow-hidden p-6 rounded-2xl border 
                 ${opt.permit_path_info.type === 'Express e-Permit'
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'}
               `}>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${opt.permit_path_info.type === 'Express e-Permit' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Recommended Strategy</div>
                      <h3 className="text-xl font-bold text-slate-900">{opt.permit_path_info.type}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-4">{opt.permit_path_info.summary}</p>

                {/* Citations */}
                {opt.permit_path_info.citations && opt.permit_path_info.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {opt.permit_path_info.citations.map((cite, i) => (
                      <span key={i} className="px-2 py-1 bg-white/60 rounded text-[10px] font-medium border border-black/5 text-slate-600 flex items-center gap-1">
                        <FileText size={10} /> {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TIMELINE (NEW) */}
          {opt.project_timeline && opt.project_timeline.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-blue-600" /> Execution Timeline
              </h3>
              <div className="space-y-4">
                {opt.project_timeline.map((phase, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-200 z-10">
                        {i + 1}
                      </div>
                      {i < opt.project_timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{phase.phase}</h4>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">{phase.duration}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLUEPRINT GENERATION SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DraftingCompass size={120} />
            </div>

            <div className="relative z-10">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-2">
                <PenTool size={16} className="text-blue-600" /> Architectural Drawings
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                Generate a technical orthographic blueprint including floor plan, elevation, and section views based on this design.
              </p>

              {opt.blueprint_status === 'generating' ? (
                <div className="w-full h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center animate-pulse border border-slate-200">
                  <DraftingCompass size={32} className="text-blue-500 animate-spin mb-3" />
                  <span className="text-sm font-medium text-slate-500">Drafting technical sheets...</span>
                </div>
              ) : opt.blueprint_url ? (
                <div className="relative w-full aspect-video bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedBlueprintUrl(opt.blueprint_url!);
                    setSelectedBlueprintTitle(opt.title);
                    setBlueprintModalOpen(true);
                  }}
                >
                  <img src={opt.blueprint_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0">
                      <Maximize2 size={16} /> View Full Blueprint
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateBlueprintForDetail(messageIndex)}
                  className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-dashed border-blue-200 rounded-xl text-blue-700 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all w-full justify-center group/btn"
                >
                  <DraftingCompass size={20} className="group-hover/btn:rotate-90 transition-transform" />
                  Generate Blueprint Package
                </button>
              )}
            </div>
          </div>

          {/* VISUAL COMPARISON (Unified Row) */}
          {opt.visual_comparisons && opt.visual_comparisons.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Layers size={16} className="text-blue-600" /> Transformation Analysis
              </h3>

              <div className="space-y-6">
                {/* Single Main Comparison Visual - 4:3 Ratio */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded z-10">Current Condition</div>
                    {referenceImage ? (
                      <img src={`data:image/jpeg;base64,${referenceImage}`} className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-slate-400">No Image</div>
                    )}
                  </div>
                  {/* Proposed (Uses Main Preview Image) */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] px-2 py-1 rounded z-10">Proposed {opt.style}</div>
                    {opt.image_url ? (
                      <img src={opt.image_url} className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-slate-400">Generating...</div>
                    )}
                  </div>
                </div>

                {/* Consolidated Modification List */}
                <div className="bg-slate-50 p-6 rounded-xl text-sm border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wide">Detailed Modification Impact</h4>
                  {opt.visual_comparisons.flatMap(vc => vc.modifications).map((mod, j) => (
                    <div key={j} className="flex justify-between items-start gap-4 mb-3 last:mb-0 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                      <span className="font-bold text-slate-700 whitespace-nowrap w-24">{mod.area}</span>
                      <div className="flex-1 text-right">
                        <span className="text-slate-600 block">{mod.change}</span>
                        <span className="text-purple-600 font-bold text-xs bg-purple-50 px-2 py-0.5 rounded inline-block mt-1">
                          <Workflow size={10} className="inline mr-1" />
                          {mod.permit_impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Permit Readiness Pack (Expanded) */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Required Plan Sheets
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {opt.permit_readiness_pack?.map((item, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                  <p className="font-bold text-slate-800 text-sm">{item.item}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
              <Wallet size={20} className="text-green-600" />
              <h3 className="font-bold text-lg">Estimated Cost</h3>
            </div>
            {opt.cost_breakdown && (
              <div className="space-y-5">
                {['Labor', 'Materials', 'Fixtures', 'Permits'].map((cat) => {
                  const k = cat.toLowerCase() as keyof typeof opt.cost_breakdown;
                  const data = opt.cost_breakdown[k] as any;
                  if (!data?.low) return null;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{cat}</span>
                        <span className="font-bold text-slate-900">{data.low} - {data.high}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic leading-tight">Driven by: {data.drivers}</p>
                    </div>
                  );
                })}
                <div className="p-3 bg-slate-900 rounded-xl text-white flex justify-between items-center mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                  <span className="font-bold text-lg">{opt.cost_breakdown.total_range}</span>
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => { setActiveDetailForConsult(opt); setShowConsult(true); }}
                className="w-full py-3 border-2 border-slate-900 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} /> Consult Expert
              </button>
              <button
                onClick={() => handleDownloadPdf(opt, 'design')}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download Plan PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSurgeryDetail = (report: SurgeryReport) => (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-4">

      <div className="p-8">

        {/* Executive Summary */}
        {report.executive_summary && report.executive_summary.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ListChecks className="text-slate-700" size={20} /> Executive Summary
              </h3>
              <button
                onClick={() => handleDownloadPdf(report, 'surgery')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Download size={14} /> Download Report
              </button>
            </div>

            {/* Coverage Disclaimer */}
            <div className="mb-4 text-xs text-slate-500 flex gap-4">
              <span className="flex items-center gap-1"><Eye size={12} /> Analyzed: {report.analysis_coverage?.join(', ')}</span>
              <span className="flex items-center gap-1 opacity-60"><EyeOff size={12} /> Not Visible: {report.analysis_limitations?.join(', ')}</span>
            </div>

            <div className="grid gap-3">
              {report.executive_summary?.map((action, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{action.action}</p>
                    <p className="text-xs text-slate-500">{action.who} • {action.time_estimate} • {action.tools}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyframes / X-Ray */}
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <ScanLine size={16} className="text-purple-500" /> MEP Digital Twin Analysis
        </h4>
        <div className="grid gap-8">
          {report.keyframes?.map((frame) => (
            <div key={frame.id} className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-800">
              {/* Large Diagram Area */}
              <div className="w-full md:w-2/3 bg-black relative group min-h-[400px]">
                {frame.image_url ? (
                  <img src={frame.image_url} className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <ScanLine size={48} className="animate-pulse mb-4 text-slate-800" />
                    <span className="text-xs font-mono uppercase tracking-widest">Generating Digital Twin...</span>
                  </div>
                )}

                {/* Overlay UI - BIM LEGEND */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-black/90 backdrop-blur border border-slate-700 text-green-400 px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    LIVE X-RAY VIEW
                  </div>
                  <div className="bg-black/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-sm flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Pipe Legend</span>
                    <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold"><span className="w-2 h-0.5 bg-blue-500"></span> COLD SUPPLY</div>
                    <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold"><span className="w-2 h-0.5 bg-red-600"></span> HOT SUPPLY</div>
                    <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold"><span className="w-2 h-0.5 bg-green-500"></span> WASTE/VENT</div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 text-slate-500 font-mono text-[10px]">
                  ID: {frame.timestamp}
                </div>
              </div>

              {/* Sidebar Annotations */}
              <div className="p-6 w-full md:w-1/3 flex flex-col bg-slate-900 border-l border-slate-800">
                <h5 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Workflow size={18} className="text-blue-400" />
                  {frame.title}
                </h5>
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                  {frame.annotations.map((note, i) => (
                    <div key={i} className="text-sm border-l-2 pl-4 py-1 border-slate-700 hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">{note.object_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                  ${note.risk_level === 'Red' ? 'bg-red-100 text-red-700' :
                            note.risk_level === 'Orange' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'}
                                `}>
                          {note.risk_level}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <span className="text-xs text-blue-300 font-mono">{note.permit_impact}</span>
                      </div>

                      {note.trigger_reason && (
                        <p className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1"><AlertTriangle size={10} /> {note.trigger_reason}</p>
                      )}
                      <p className="text-slate-400 text-xs leading-relaxed">{note.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full transition-all duration-700 ease-in-out relative flex flex-col items-center min-h-[70vh] justify-center bg-slate-50">

      {showWizard ? (
        <div className="w-full px-4 py-8 mt-12 mb-20 animate-in fade-in zoom-in-95 duration-700">
          <IntakeWizard onComplete={handleIntakeComplete} />
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-12">
          {messages.map((m, idx) => (
            <div key={idx} className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Text Message Bubble */}
              {m.content && (
                <div className={`
                      px-6 py-4 rounded-3xl max-w-[90%] md:max-w-[80%] text-lg shadow-sm
                      ${m.role === 'user'
                    ? 'self-end bg-slate-900 text-white rounded-tr-sm'
                    : 'self-start bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}
                    `}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}

              {/* VIDEO MESSAGE (Inline) */}
              {m.video && (
                <div className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <Video size={20} className="text-purple-600" />
                    <span className="font-bold text-slate-800">Virtual Tour: {m.video.title}</span>
                  </div>
                  <div className="aspect-video bg-black relative">
                    <video
                      src={m.video.url}
                      controls
                      autoPlay
                      muted // Added for iOS autoplay compatibility
                      playsInline // Added for iOS inline playback
                      preload="metadata" // Added for performance
                      crossOrigin="anonymous" // Ensure header access
                      className="w-full h-full"
                      onError={(e) => {
                        console.error("Video Error:", e.currentTarget.error);
                      }}
                    />
                  </div>
                  <div className="p-4 flex justify-end">
                    <a
                      href={m.video.url}
                      download={`tour-${m.video.title}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2"
                    >
                      <Download size={14} /> Download Video
                    </a>
                  </div>
                </div>
              )}

              {/* PREVIEW CARDS (Vertical Stack) */}
              {m.previews && (
                <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto mt-4">
                  {m.previews.map((card, cardIndex) => (
                    <div key={card.id} className="relative group">
                      <button
                        onClick={() => handleCardClick(card)}
                        disabled={loadingDetailId !== null}
                        className="w-full aspect-[16/9] bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all overflow-hidden cursor-pointer text-left relative"
                      >
                        {/* Background Image */}
                        {card.image_url ? (
                          <img src={card.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border backdrop-blur-md
                                        ${card.type === 'surgery'
                                ? 'bg-blue-500/80 text-white border-blue-400'
                                : 'bg-white/20 text-white border-white/30'}
                                      `}>
                              {card.type === 'surgery' ? 'Plumbing Analysis' : 'Design Direction'}
                            </span>
                          </div>
                          <h3 className="text-3xl font-serif text-white mb-2">{card.title}</h3>
                          <p className="text-slate-300 text-sm md:text-base line-clamp-1">{card.description}</p>
                        </div>

                        {/* Loading Overlay */}
                        {loadingDetailId === card.id && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="flex flex-col items-center gap-3">
                              <Sparkles className="animate-spin text-purple-400" size={32} />
                              <span className="font-bold text-white tracking-widest uppercase text-sm">Generating Roadmap...</span>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* GENERATE VIDEO BUTTON (Design cards only) */}
                      {card.type === 'design' && card.image_url && (
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateVideo(card, idx, cardIndex);
                            }}
                            disabled={card.video_status === 'generating'}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border transition-all
                                            ${card.video_url
                                ? 'bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600'
                                : 'bg-white/90 text-slate-800 border-white/50 hover:bg-white'}
                                        `}
                          >
                            {card.video_status === 'generating' ? (
                              <>
                                <Video size={14} className="animate-spin" /> Creating Tour...
                              </>
                            ) : card.video_url ? (
                              <>
                                <PlayCircle size={14} /> Watch Tour
                              </>
                            ) : (
                              <>
                                <Video size={14} /> Virtual Tour
                              </>
                            )}
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

              {/* DETAILED VIEW (Rendered Inline) */}
              {m.detail && m.detailType === 'design' && renderDesignDetail(m.detail as DesignOption, idx)}
              {m.detail && m.detailType === 'surgery' && renderSurgeryDetail(m.detail as SurgeryReport)}

            </div>
          ))}

          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                <Sparkles size={24} />
                <span className="text-lg">Architecting your options...</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!showWizard && (
            <div className="sticky bottom-6 mt-12 w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-2 shadow-xl ring-1 ring-slate-100 z-30">

              {/* File Upload Preview Strip */}
              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-b border-slate-100 mb-2 overflow-x-auto">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="relative group shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        {file.mimeType.includes('image') ? (
                          <img src={file.previewUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            {file.mimeType.includes('video') ? <Video size={20} /> : <FileText size={20} />}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-slate-400 font-medium px-2">
                    Ready to analyze
                  </div>
                </div>
              )}

              {isProcessingFiles && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 animate-pulse border-b border-slate-100 mb-2">
                  <Loader2 className="animate-spin text-blue-500" size={16} />
                  <span>Processing files... Do not close.</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingFiles} className="p-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full hover:bg-slate-100 disabled:opacity-50"><Plus size={20} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf,video/*" multiple className="hidden" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[#1e293b] placeholder:text-slate-400 text-base"
                  style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a', caretColor: '#0f172a', colorScheme: 'light' }}
                  placeholder="Ask follow up..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button onClick={() => handleSubmit()} disabled={loading || isProcessingFiles} className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"><ArrowUp size={22} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLUEPRINT MODAL */}
      {blueprintModalOpen && selectedBlueprintUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-black rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 bg-black text-white border-b border-white/10">
              <h3 className="text-lg font-mono tracking-widest uppercase">
                Blueprint: {selectedBlueprintTitle}
              </h3>
              <div className="flex gap-4">
                <a
                  href={selectedBlueprintUrl}
                  download={`blueprint-${selectedBlueprintTitle}.png`}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                >
                  <Download size={14} /> Download
                </a>
                <button onClick={() => setBlueprintModalOpen(false)} className="hover:text-red-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-[#f0e6d2] p-8">
              <img src={selectedBlueprintUrl} className="max-w-full max-h-full object-contain shadow-2xl" alt="Blueprint" />
            </div>
          </div>
        </div>
      )}

      <ConsultModal
        isOpen={showConsult}
        onClose={() => setShowConsult(false)}
        intakeData={intakeData || undefined}
        selectedDesign={activeDetailForConsult}
        onSendRequest={handleSendConsultRequest}
      />

    </section>
  );
}