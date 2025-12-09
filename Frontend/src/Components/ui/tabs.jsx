import React, { createContext, useContext, useState } from "react"

const TabsContext = createContext({})

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
    const [selected, setSelected] = useState(defaultValue)
    const current = value !== undefined ? value : selected

    const handleChange = (newValue) => {
        if (onValueChange) {
            onValueChange(newValue)
        } else {
            setSelected(newValue)
        }
    }

    return (
        <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
            <div className={className} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 ${className}`}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useContext(TabsContext)
    const isSelected = selectedValue === value

    return (
        <button
            ref={ref}
            type="button"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 ${isSelected
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                } ${className}`}
            onClick={() => onValueChange(value)}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selectedValue } = useContext(TabsContext)
    if (value !== selectedValue) return null

    return (
        <div
            ref={ref}
            className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 ${className}`}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
