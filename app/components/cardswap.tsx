'use client';

import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    ReactElement,
    ReactNode,
    useEffect,
    useRef
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (idx: number) => void;
    skewAmount?: number;
    easing?: 'linear' | 'elastic';
    children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={`absolute top-1/2 left-1/2 rounded-xl border border-white bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
));
Card.displayName = 'Card';

interface Slot {
    x: number;
    y: number;
    z: number;
    zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

const CardSwap: React.FC<CardSwapProps> = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}) => {
    const childArr = Children.toArray(children) as ReactElement<CardProps>[];
    const order = useRef<number[]>([]);

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const intervalRef = useRef<number>(0);
    const isHoveredRef = useRef(false);
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config =
            easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.18,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.08,
                returnDelay: 0.2
            };

        const node = container.current;
        if (!node) return;

        const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-cardswap-card="true"]'));
        order.current = Array.from({ length: cards.length }, (_, i) => i);

        const total = cards.length;
        cards.forEach((card, i) => placeNow(card, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

        const swap = () => {
            if (isHoveredRef.current || order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const elFront = cards[front];
            const tl = gsap.timeline();
            tlRef.current = tl;
            const dropDistance = Math.max(verticalDistance * 4.5, 220);
            const backSlot = makeSlot(cards.length - 1, cardDistance, verticalDistance, cards.length);

            tl.to(elFront, {
                y: `+=${dropDistance}`,
                duration: config.durDrop,
                ease: config.ease
            });

            tl.call(() => {
                gsap.set(elFront, { zIndex: backSlot.zIndex });
            });

            tl.addLabel('promote');
            rest.forEach((idx, i) => {
                const el = cards[idx];
                const slot = makeSlot(i, cardDistance, verticalDistance, cards.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease
                    },
                    `promote+=${i * 0.15}`
                );
            });

            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: config.durReturn,
                    ease: config.ease
                },
                'return'
            );

            tl.call(() => {
                order.current = [...rest, front];
            });
        };

        swap();
        intervalRef.current = window.setInterval(swap, delay);

        if (pauseOnHover) {
            const stopInterval = () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = 0;
                }
            };
            const startInterval = () => {
                stopInterval();
                intervalRef.current = window.setInterval(swap, delay);
            };
            const pause = () => {
                isHoveredRef.current = true;
                tlRef.current?.pause();
                stopInterval();
            };
            const resume = () => {
                isHoveredRef.current = false;
                tlRef.current?.play();
                startInterval();
            };
            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);
            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                stopInterval();
            };
        }
        return () => clearInterval(intervalRef.current);
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) =>
        isValidElement<CardProps>(child)
            ? cloneElement(child, {
                key: i,
                'data-cardswap-card': 'true',
                style: { width, height, ...(child.props.style ?? {}) },
                onClick: e => {
                    child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
                    onCardClick?.(i);
                }
            } as CardProps & React.RefAttributes<HTMLDivElement>)
            : child
    );

    return (
        <div
            ref={container}
            className="relative mx-auto h-full origin-center perspective-[900px] overflow-visible max-[768px]:scale-[0.8] max-[480px]:scale-[0.62]"
            style={{ width, height }}
        >
            {rendered}
        </div>
    );
};

export default CardSwap;
