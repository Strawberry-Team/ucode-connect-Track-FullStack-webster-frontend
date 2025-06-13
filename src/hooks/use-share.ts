import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTool } from '@/context/tool-context';
import { uploadToImgBB } from '@/lib/api/imgbb';
import { copyToClipboard, generateImageName } from '@/utils/imgbb-uploader';
import type Konva from 'konva';

interface UseShareProps {
    stageRef: React.MutableRefObject<Konva.Stage | null> | null;
    stageSize: { width: number; height: number } | null;
}

export const useShare = ({ stageRef, stageSize }: UseShareProps) => {
    const { projectId, projectName } = useTool();
    const [isSharing, setIsSharing] = useState(false);

    /**
     * Export canvas as PNG in base64 without UI elements
     */
    const exportCanvasAsPNG = useCallback(async (): Promise<string> => {
        if (!stageRef?.current || !stageSize) {
            throw new Error('Canvas не готовий для експорту');
        }

        const stage = stageRef.current;

        // Find and temporarily hide UI elements that should not be exported
        const backgroundNode = stage.findOne(".background-pattern") as Konva.Rect | null;
        const wasBackgroundVisible = backgroundNode?.visible();

        // Find and hide all transformers
        const transformers = stage.find('Transformer');
        const transformersVisibility: boolean[] = [];
        transformers.forEach((transformer) => {
            transformersVisibility.push(transformer.visible());
        });

        // Find UI layers (snap lines, crop tools, etc.)
        const layers = stage.find('Layer');
        const uiLayers: Konva.Layer[] = [];
        const uiLayersVisibility: boolean[] = [];

        // Hide the last 2 layers, which usually contain UI elements
        if (layers.length >= 2) {
            const lastTwoLayers = layers.slice(-2) as Konva.Layer[];
            lastTwoLayers.forEach((layer) => {
                uiLayers.push(layer);
                uiLayersVisibility.push(layer.visible());
            });
        }

        let cleanDataURL: string;

        try {
            // Hide background pattern
            if (backgroundNode) {
                backgroundNode.visible(false);
            }

            // Hide all transformers
            transformers.forEach((transformer) => {
                transformer.visible(false);
            });

            // Hide UI layers
            uiLayers.forEach((layer) => {
                layer.visible(false);
            });

            stage.batchDraw(); // Force redraw

            // Get clean content of stage without background pattern and UI elements
            cleanDataURL = stage.toDataURL({
                mimeType: "image/png",
                quality: 1
            });
        } finally {
            // Restore visibility of background pattern
            if (backgroundNode && wasBackgroundVisible) {
                backgroundNode.visible(true);
            }

            // Restore visibility of transformers
            transformers.forEach((transformer, index) => {
                transformer.visible(transformersVisibility[index]);
            });

            // Restore visibility of UI layers
            uiLayers.forEach((layer, index) => {
                layer.visible(uiLayersVisibility[index]);
            });

            stage.batchDraw(); // Force redraw
        }

        // Create final export canvas with transparent background
        return new Promise((resolve, reject) => {
            const stageImage = new Image();

            stageImage.onload = () => {
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = stageSize.width;
                exportCanvas.height = stageSize.height;
                const exportCtx = exportCanvas.getContext('2d')!;

                // Draw clean content of stage
                exportCtx.drawImage(stageImage, 0, 0);

                resolve(exportCanvas.toDataURL("image/png", 1));
            };

            stageImage.onerror = () => {
                reject(new Error("Failed to load stage image for export"));
            };

            stageImage.src = cleanDataURL;
        });
    }, [stageRef, stageSize]);

    /**
     * Copy link function - uploads to ImgBB and copies link to clipboard
     */
    const copyLink = useCallback(async (): Promise<void> => {
        if (isSharing) return;

        setIsSharing(true);

        try {
            // Export canvas as PNG base64
            // toast.info('Preparing image...', {
            //     description: 'Exporting your project',
            //     duration: 2000,
            // });

            const base64Image = await exportCanvasAsPNG();

            // Upload to ImgBB
            // toast.info('Uploading...', {
            //     description: 'Uploading image to server',
            //     duration: 3000,
            // });

            const imageName = generateImageName(projectId || 'project');
            const expirationTime = 1209600; // 14 days
            const uploadResponse = await uploadToImgBB(base64Image, imageName, expirationTime);

            // Copy link to clipboard
            const imageUrl = uploadResponse.data.url;
            await copyToClipboard(imageUrl);

            toast.success('Successfully uploaded!', {
                description: 'Link copied to clipboard',
                duration: 5000,
            });

        } catch (error) {
            console.error('Error sharing project:', error);

            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error('Upload error', {
                description: errorMessage,
                duration: 5000,
            });
        } finally {
            setIsSharing(false);
        }
    }, [isSharing, exportCanvasAsPNG, projectId]);

    /**
     * Share to Gmail
     */
    const shareToGmail = useCallback(async (): Promise<void> => {
        try {
            const base64Image = await exportCanvasAsPNG();
            const projectTitle = projectName || 'My Creative Project';

            const subject = `Check out my project '${projectTitle}' created on Flowy ✨`;
            const body = `Hi! 👋\n\nI'd like to share my '${projectTitle}' project. 🎉\n\nI created it using a powerful online design tool 'Flowy'. 🪄 Hope you like it! 🤩\n\nBest regards 😊`;
            const bodyShort = `I'd like to share my '${projectTitle}' project. 🎉\nI created it using a powerful online design tool 'Flowy'. 🪄 Hope you like it! 😊`;

            // Gmail doesn't support base64 attachments directly via mailto, so we'll include a note about the image
            const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&ui=2&tf=1`;

            // Copy image to clipboard for manual pasting
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    // Convert base64 to blob
                    const response = await fetch(base64Image);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);

                    toast.success('Image copied to clipboard!', {
                        description: 'You can paste it in Gmail',
                        duration: 3000,
                    });
                } catch (clipboardError) {
                    console.warn('Failed to copy image to clipboard:', clipboardError);
                }
            }

            window.open(mailtoUrl, '_blank');

        } catch (error) {
            console.error('Error sharing to Gmail:', error);
            toast.error('Error sharing to Gmail', {
                description: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        }
    }, [exportCanvasAsPNG, projectName]);

    /**
     * Share to Facebook
     */
    const shareToFacebook = useCallback(async (): Promise<void> => {
        if (isSharing) return;

        setIsSharing(true);
        
        try {
            const base64Image = await exportCanvasAsPNG();
            const projectTitle = projectName || 'My Creative Project';
            
            const bodyShort = `I'd like to share my '${projectTitle}' project. 🎉\nI created it using a powerful online design tool 'Flowy'. 🪄 Hope you like it! 😊`;
            
            // Upload image to ImgBB first to get the URL
            toast.info('Preparing image for Facebook...', {
                description: 'Uploading image to server',
                duration: 2000,
            });

            const imageName = generateImageName(projectId || 'project');
            const expirationTime = 1209600; // 14 days
            const uploadResponse = await uploadToImgBB(base64Image, imageName, expirationTime);
            
            const imageUrl = uploadResponse.data.url;
            
            // Copy image to clipboard
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const response = await fetch(base64Image);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    toast.success('Image copied to clipboard!', {
                        description: 'You can paste it in your Facebook post',
                        duration: 3000,
                    });
                } catch (clipboardError) {
                    console.warn('Failed to copy image to clipboard:', clipboardError);
                }
            }
            
            // Use Facebook sharing URL with image URL and quote text
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(bodyShort)}`;
            window.open(facebookUrl, '_blank');
            
        } catch (error) {
            console.error('Error sharing to Facebook:', error);
            toast.error('Error sharing to Facebook', {
                description: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        } finally {
            setIsSharing(false);
        }
    }, [isSharing, exportCanvasAsPNG, projectName, projectId]);

    /**
     * Share to Instagram
     */
    const shareToInstagram = useCallback(async (): Promise<void> => {
        try {
            const base64Image = await exportCanvasAsPNG();
            const projectTitle = projectName || 'My Creative Project';
            
            const bodyShort = `I'd like to share my '${projectTitle}' project. 🎉\nI created it using a powerful online design tool 'Flowy'. 🪄 Hope you like it! 😊`;
            
            // Instagram doesn't have direct web sharing API, so we'll copy image and redirect to Instagram
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const response = await fetch(base64Image);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    toast.success('Image and caption copied!', {
                        description: 'Opening Instagram. Paste the image and use the copied caption.',
                        duration: 4000,
                    });
                } catch (clipboardError) {
                    console.warn('Failed to copy image to clipboard:', clipboardError);
                }
            }
            
            // Copy caption text to clipboard as well
            try {
                await navigator.clipboard.writeText(bodyShort);
            } catch (textClipboardError) {
                console.warn('Failed to copy caption to clipboard:', textClipboardError);
            }
            
            // Try to open Instagram app or website with create post intent
            const instagramUrl = 'https://www.instagram.com/';
            window.open(instagramUrl, '_blank');
            
        } catch (error) {
            console.error('Error sharing to Instagram:', error);
            toast.error('Error sharing to Instagram', {
                description: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        }
    }, [exportCanvasAsPNG, projectName]);

    /**
     * Share to Telegram
     */
    const shareToTelegram = useCallback(async (): Promise<void> => {
        if (isSharing) return;

        setIsSharing(true);
        
        try {
            const base64Image = await exportCanvasAsPNG();
            const projectTitle = projectName || 'My Creative Project';
            
            const bodyShort = `I'd like to share my '${projectTitle}' project. 🎉\nI created it using a powerful online design tool 'Flowy'. 🪄 Hope you like it! 😊`;
            
            // Upload image to ImgBB first to get the URL
            toast.info('Preparing image for Telegram...', {
                description: 'Uploading image to server',
                duration: 2000,
            });

            const imageName = generateImageName(projectId || 'project');
            const expirationTime = 1209600; // 14 days
            const uploadResponse = await uploadToImgBB(base64Image, imageName, expirationTime);
            
            const imageUrl = uploadResponse.data.url;
            
            // Copy image to clipboard
            if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                try {
                    const response = await fetch(base64Image);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    
                    toast.success('Image copied to clipboard!', {
                        description: 'You can paste it in Telegram',
                        duration: 3000,
                    });
                } catch (clipboardError) {
                    console.warn('Failed to copy image to clipboard:', clipboardError);
                }
            }
            
            // Create Telegram URL with image URL and text
            const telegramUrl = `tg://msg_url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(bodyShort)}`;
            
            // Try to open Telegram desktop app and detect if it opens
            let desktopAppOpened = false;
            
            // Listen for window focus/blur events to detect if desktop app opened
            const handleBlur = () => {
                desktopAppOpened = true;
                window.removeEventListener('blur', handleBlur);
            };
            
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    desktopAppOpened = true;
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                }
            };
            
            window.addEventListener('blur', handleBlur);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Try to open Telegram app
            window.location.href = telegramUrl;
            
            toast.success('Opening Telegram...', {
                description: 'Image uploaded and Telegram is opening with your message',
                duration: 3000,
            });
            
            // Fallback to web version only if desktop app doesn't open
            setTimeout(() => {
                // Clean up event listeners
                window.removeEventListener('blur', handleBlur);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                
                // Only open web version if desktop app didn't open
                if (!desktopAppOpened) {
                    console.log('Desktop Telegram app not detected, opening web version');
                    const webUrl = `https://web.telegram.org/k/#777000?text=${encodeURIComponent(`${bodyShort}\n\n${imageUrl}`)}`;
                    window.open(webUrl, '_blank');
                    
                    toast.info('Opening Telegram Web...', {
                        description: 'Desktop app not found, using web version',
                        duration: 3000,
                    });
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error sharing to Telegram:', error);
            toast.error('Error sharing to Telegram', {
                description: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        } finally {
            setIsSharing(false);
        }
    }, [isSharing, exportCanvasAsPNG, projectName, projectId]);

    /**
     * Main function to share project (for backward compatibility)
     */
    const shareProject = copyLink;

    return {
        shareProject,
        copyLink,
        shareToGmail,
        shareToFacebook,
        shareToInstagram,
        shareToTelegram,
        isSharing,
        exportCanvasAsPNG
    };
}; 