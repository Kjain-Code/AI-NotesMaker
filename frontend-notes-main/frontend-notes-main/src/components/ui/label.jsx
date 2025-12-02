import * as React from "react"

import { cn } from "@/lib/utils"

// I need to install @radix-ui/react-label or just use a standard label.
// I'll use a standard label for now to avoid extra deps unless necessary.
// Actually, for a label, a simple label element is fine.

const Label = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
})
Label.displayName = "Label"

export { Label }
