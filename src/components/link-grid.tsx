import type { LinkGridProps } from '@/app/(full-layout)/page'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LinkGrid({ links, title }: LinkGridProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(link => (
          <Link
            key={link.title}
            href={link.href}
            target={link.target}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {link.icon}
                  </div>
                  <CardTitle className="text-lg">
                    {link.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {link.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
