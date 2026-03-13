'use client'

import type { Image } from '@/server/api/routers/asset'
import {
  Calendar,
  Camera,
  Download,
  FileImage,
  Globe,
  Hash,
  ImageIcon,
  MapPin,
  Maximize,
  Package,
  Percent,
  Settings,
  Tag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatFileSize } from '@/utils'
import { cn } from '@/utils/cn'

interface ImageInfoModalProps {
  image: Image
  isOpen: boolean
  onCloseAction: () => void
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  className?: string
}

function InfoItem({ icon, label, value, className }: InfoItemProps) {
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors', className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm font-medium text-foreground break-all">{value}</div>
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </div>
      {children}
    </div>
  )
}

export function ImageInfoModal({ image, isOpen, onCloseAction }: ImageInfoModalProps) {
  // 计算压缩率
  const compressionRatio = Math.round(
    (1 - Number(image.compressed_size) / Number(image.original_size)) * 100,
  )

  // 格式化日期
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date)
      return '-'
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 获取EXIF中的关键信息
  const getExifDisplayName = (key: string): string => {
    const nameMap: Record<string, string> = {
      Make: '相机品牌',
      Model: '相机型号',
      LensModel: '镜头型号',
      DateTimeOriginal: '拍摄时间',
      ExposureTime: '曝光时间',
      FNumber: '光圈',
      ISOSpeedRatings: 'ISO',
      FocalLength: '焦距',
      ImageWidth: '图片宽度',
      ImageHeight: '图片高度',
      Orientation: '方向',
      Flash: '闪光灯',
      WhiteBalance: '白平衡',
      GPSLatitude: '纬度',
      GPSLongitude: '经度',
      GPSAltitude: '海拔',
      Software: '软件',
    }
    return nameMap[key] || key
  }

  // 格式化EXIF值
  const formatExifValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined)
      return '-'
    const strValue = String(value)

    // 特殊格式化
    if (key === 'ExposureTime' && strValue.includes('/')) {
      return strValue
    }
    if (key === 'FNumber') {
      return `f/${strValue}`
    }
    if (key === 'FocalLength') {
      return `${strValue}mm`
    }
    if (key === 'ISOSpeedRatings') {
      return `ISO ${strValue}`
    }

    return strValue
  }

  // 优先显示的关键EXIF信息
  const priorityExifKeys = [
    'Make',
    'Model',
    'LensModel',
    'DateTimeOriginal',
    'ExposureTime',
    'FNumber',
    'ISOSpeedRatings',
    'FocalLength',
  ]

  const exifEntries = image.exif && Object.keys(image.exif).length > 0
    ? Object.entries(image.exif)
        .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    : []

  const priorityExif = exifEntries.filter(([key]) => priorityExifKeys.includes(key))
  const otherExif = exifEntries.filter(([key]) => !priorityExifKeys.includes(key))

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onCloseAction()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
              图片信息
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onCloseAction}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 图片预览 */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted border border-border/50 group">
            <img
              src={image.thumbnail_768x_url || image.compressed_url}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 基本信息 */}
          <Section title="基本信息" icon={<FileImage className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoItem
                icon={<Tag className="w-4 h-4" />}
                label="文件名"
                value={image.name}
              />
              <InfoItem
                icon={<Hash className="w-4 h-4" />}
                label="图片 ID"
                value={<span className="font-mono text-xs">{image.id}</span>}
              />
              <InfoItem
                icon={<Package className="w-4 h-4" />}
                label="原始大小"
                value={formatFileSize(image.original_size)}
              />
              <InfoItem
                icon={<Package className="w-4 h-4" />}
                label="压缩后大小"
                value={formatFileSize(image.compressed_size)}
              />
              <InfoItem
                icon={<Percent className="w-4 h-4" />}
                label="压缩率"
                value={(
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    compressionRatio > 50
                      ? 'bg-green-500/10 text-green-600'
                      : compressionRatio > 30
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-blue-500/10 text-blue-600',
                  )}
                  >
                    {compressionRatio}
                    %
                  </span>
                )}
              />
              <InfoItem
                icon={<Maximize className="w-4 h-4" />}
                label="尺寸"
                value={`${image.width} × ${image.height}`}
              />
            </div>
          </Section>

          {/* 元数据信息 */}
          <Section title="元数据" icon={<Settings className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoItem
                icon={<Globe className="w-4 h-4" />}
                label="访问权限"
                value={image.isPublic ? '公开' : '私有'}
              />
              {image.category && (
                <InfoItem
                  icon={<Tag className="w-4 h-4" />}
                  label="分类"
                  value={image.category}
                />
              )}
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="上传时间"
                value={formatDate(image.createdAt)}
              />
            </div>
          </Section>

          {/* EXIF 信息 */}
          {exifEntries.length > 0 && (
            <Section title="EXIF 信息" icon={<Camera className="w-3.5 h-3.5" />}>
              {/* 优先显示的EXIF */}
              {priorityExif.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {priorityExif.map(([key, value]) => (
                    <InfoItem
                      key={key}
                      icon={<Settings className="w-4 h-4" />}
                      label={getExifDisplayName(key)}
                      value={formatExifValue(key, value)}
                    />
                  ))}
                </div>
              )}

              {/* 其他EXIF信息 */}
              {otherExif.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30">
                  <div className="text-xs font-medium text-muted-foreground mb-2">其他信息</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                    {otherExif.map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-muted-foreground truncate">{getExifDisplayName(key)}</span>
                        <span className="font-medium text-foreground truncate" title={String(value)}>
                          {formatExifValue(key, value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* 地址信息 */}
          {image.address && (
            <Section title="拍摄位置" icon={<MapPin className="w-3.5 h-3.5" />}>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{image.address}</div>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 flex justify-end gap-2 z-10">
          <Button variant="outline" onClick={onCloseAction}>
            关闭
          </Button>
          <Button onClick={() => window.open(image.original_url, '_blank')}>
            <Download className="w-4 h-4 mr-2" />
            查看原图
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
