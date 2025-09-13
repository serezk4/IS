'use client';
import * as Tooltip from "@radix-ui/react-tooltip";
import {ReactNode} from "react";

export function DisabledWithTooltip({disabled, label, children}: {
    disabled: boolean;
    label: string;
    children: ReactNode
}) {
    if (!disabled) return <>{children}</>;
    return (
        <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow">
                        {label}
                        <Tooltip.Arrow className="fill-popover"/>
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}

export default DisabledWithTooltip;
