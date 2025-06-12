import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Copy, 
  Instagram, 
  Facebook, 
  Send, 
  Mail,
  Loader2,
  Download,
  ExternalLink,
  Twitter,
  MessageCircle,
  Globe
} from 'lucide-react'
import { useTool } from '@/context/tool-context'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 8px;
    background-color: #292C31;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #44474A;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-track {
    background-color: #292C31;
    border-radius: 4px;
  }
`

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const { stageRef } = useTool()

  const exportCanvasAsJPG = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!stageRef?.current) {
        reject(new Error('Canvas not found'))
        return
      }

      try {
        const stage = stageRef.current
        const dataURL = stage.toDataURL({
          mimeType: 'image/jpeg',
          quality: 0.9,
          pixelRatio: 1
        })
        
        fetch(dataURL)
          .then(res => res.blob())
          .then(blob => resolve(blob))
          .catch(err => reject(err))
      } catch (error) {
        reject(error)
      }
    })
  }

  const uploadToFreeImage = async (imageBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('source', imageBlob, 'artwork.jpg')
      formData.append('key', '6d207e02198a847aa98d0a2a901485a5')

      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.status_code !== 200) {
        throw new Error(data.error?.message || 'Upload failed')
      }

      return data.image.url
    } catch (error) {
      throw new Error('Failed to upload to FreeImage.host')
    }
  }

  const handleGenerateShareContent = async () => {
    try {
      setIsUploading(true)
      const imageBlob = await exportCanvasAsJPG()
      const imageUrl = await uploadToFreeImage(imageBlob)
      setUploadedUrl(imageUrl)
      setShareUrl(imageUrl)
      toast.success('Image uploaded to FreeImage.host!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleDownload = async () => {
    try {
      const imageBlob = await exportCanvasAsJPG()
      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'artwork.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const handleSocialShare = async (platform: string) => {
    const text = encodeURIComponent('Check out my artwork!')
    let shareLink = ''

    switch (platform) {
      case 'instagram':
        shareLink = 'instagram://share?type=image'
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = 'https://www.instagram.com/create/select/'
        }
        toast.info('Image downloaded! Instagram opened for manual upload.')
        await handleDownload()
        break
      case 'facebook':
        shareLink = 'fb://publish'
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('Facebook opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'twitter':
        shareLink = 'twitter://post'
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://x.com/compose/tweet?text=${text}&url=${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('X opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'tiktok':
        shareLink = 'tiktok://upload'
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = 'https://www.tiktok.com/upload'
        }
        toast.info('Image downloaded! TikTok opened for manual upload.')
        await handleDownload()
        break
      case 'telegram':
        shareLink = `tg://msg?text=${text}%20${encodeURIComponent(shareUrl || '')}`
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://t.me/?text=${text}%20${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('Telegram opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'whatsapp':
        shareLink = `whatsapp://send?text=${text}%20${encodeURIComponent(shareUrl || '')}`
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://web.whatsapp.com/send?text=${text}%20${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('WhatsApp opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'pinterest':
        shareLink = `pinterest://pin/create?description=${text}&media=${encodeURIComponent(shareUrl || '')}`
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://www.pinterest.com/pin-builder/?description=${text}&media=${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('Pinterest opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'reddit':
        shareLink = `reddit://create?text=${text}&url=${encodeURIComponent(shareUrl || '')}`
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl || '')}&title=${text}`
        }
        toast.info('Reddit opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'tumblr':
        shareLink = `tumblr://x-callback-url/post?type=photo&caption=${text}&url=${encodeURIComponent(shareUrl || '')}`
        if (!navigator.userAgent.includes('Mobile')) {
          shareLink = `https://www.tumblr.com/new/photo?caption=${text}&source=${encodeURIComponent(shareUrl || '')}`
        }
        toast.info('Tumblr opened. Please paste your image or link.')
        if (!shareUrl) await handleDownload()
        break
      case 'gmail':
        shareLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${text}&body=${text}%0A%0A${encodeURIComponent(shareUrl || 'Please find the attached artwork image.')}`
        toast.info('Gmail opened. Please attach your downloaded image.')
        if (!shareUrl) await handleDownload()
        break
      default:
        return
    }

    window.open(shareLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[80vh] h-full bg-[#2D2F34FF] text-gray-300 border-none p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 w-full">
          <DialogTitle className="m-0 text-base font-normal text-center text-gray-300">Share Your Project</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col p-6 pb-0 flex-1 overflow-auto">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleGenerateShareContent}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-md transition-colors duration-200"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Upload & Share
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
                className="bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {shareUrl && (
            <div className="space-y-2 mb-6">
              <div className="text-xs text-gray-300 font-medium">Image uploaded to FreeImage.host:</div>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="px-3 py-2 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Note: For social media, images will be auto-downloaded for manual upload if not shared via link
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 text-center">Share on social media:</h4>
            
            <div className="text-xs text-gray-400 text-center bg-[#3A3D44FF] border border-[#4A4D54FF] rounded-md p-3 mb-4">
              <div className="mb-1">🔗 <strong>Upload & Share</strong> - Upload to FreeImage.host</div>
              <div>💾 <strong>Download</strong> - Download image file</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSocialShare('instagram')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <Twitter className="w-4 h-4" />
                X
              </Button>
              
              <Button
                onClick={() => handleSocialShare('tiktok')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
                </svg>
                TikTok
              </Button>
              
              <Button
                onClick={() => handleSocialShare('telegram')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <Send className="w-4 h-4" />
                Telegram
              </Button>
              
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              
              <Button
                onClick={() => handleSocialShare('pinterest')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194 1.384 2.167 3.262 2.167 3.916 0 6.927-4.128 6.927-9.795 0-5.12-4.139-8.754-9.506-8.754zm-1.614 18.224c-.66 0-1.303-.188-1.879-.573l-.507 1.933c-.39 1.494-1.536 3.058-1.814 3.408-.184.231-.412.354-.653.354-.165 0-.331-.042-.484-.128-.614-.344.057-2.116.312-3.135l1.225-4.686c-.138-.552-.615-1.013-1.225-1.013-.943 0-1.706.858-1.706 1.92 0 .797.314 1.512.628 2.042l-.144.553c-.316 1.209-.943 2.427-1.034 2.653-.162.404-.463.645-.85.645-.207 0-.413-.068-.593-.204-.614-.463.115-2.827.493-4.012.278-1.063.628-2.427.628-2.427s-.314-1.788-.314-4.427c0-4.139 2.398-7.506 5.506-7.506 2.896 0 5.003 2.067 5.003 4.835 0 2.896-1.829 5.229-4.368 5.229-1.706 0-3.262-1.414-2.814-3.135.552-2.116 1.614-4.368 1.614-5.879 0-1.373-.738-2.512-2.262-2.512-1.788 0-3.229 1.845-3.229 4.079 0 1.512.628 3.135.943 4.012-.314 1.414-1.034 3.135-1.034 4.427 0 2.512 1.614 4.368 3.776 4.368 2.896 0 5.003-2.512 5.003-5.879 0-3.229-2.607-5.506-5.506-5.506z"/>
                </svg>
                Pinterest
              </Button>
              
              <Button
                onClick={() => handleSocialShare('reddit')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.25a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.042-.52A1.75 1.75 0 0 1 4.75 12c0-.968.786-1.754 1.754-1.754.477 0 .898.182 1.206.492 1.195-.856 2.85-1.417 4.674-1.488l-.8-3.747-2.597.547A1.25 1.25 0 0 1 7.75 4.75c0-.689.561-1.25 1.25-1.25.689 0 1.25.561 1.25 1.25 0 .369-.128.713-.349.981l2.614-.552c.224-.237.52-.386.876-.386zm0 2.506a.625.625 0 0 0-.625.625c0 .346.28.625.625.625s.625-.279.625-.625a.625.625 0 0 0-.625-.625zm-9.5 0a.625.625 0 0 0-.625.625c0 .346.28.625.625.625s.625-.279.625-.625a.625.625 0 0 0-.625-.625zm4.5 3.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm4.5 0c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/>
                </svg>
                Reddit
              </Button>
              
              <Button
                onClick={() => handleSocialShare('tumblr')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.296-.924 4.365-3.498 4.531-5.924C9.653.436 10.081 0 10.565 0h3.828v6.747h4.552v3h-4.552v6.569c0 1.873.797 2.508 2.465 2.508h2.418v3.135h-3.262c-.602 0-1.668-.093-2.451-.275z"/>
                </svg>
                Tumblr
              </Button>
              
              <Button
                onClick={() => handleSocialShare('gmail')}
                variant="outline"
                className="flex items-center justify-center gap-2 py-3 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 hover:bg-[#4A4D54FF] hover:border-gray-600 transition-colors duration-200 rounded-md"
              >
                <Mail className="w-4 h-4" />
                Gmail
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 px-6 py-4 bg-[#2D2F34FF] rounded-b-lg border-t border-[#4A4D54FF]">
          <div className="text-xs text-gray-400">
            Share your artwork with the world
          </div>
          
          <div className="text-xs text-gray-400">
            <strong>Note:</strong> Images auto-download for social media upload if no link
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal