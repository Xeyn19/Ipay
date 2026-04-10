'use client';

import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
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
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}) => {
    const childArr = Children.toArray(children) as ReactElement<CardProps>[];
    const order = useRef<number[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLElement[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                returnDelay: 0.2
            };

    // Initialize card positions on mount
    useEffect(() => {
        const node = container.current;
        if (!node) return;

        const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-cardswap-card="true"]'));
        cardsRef.current = cards;
        order.current = Array.from({ length: cards.length }, (_, i) => i);

        const total = cards.length;
        cards.forEach((card, i) => placeNow(card, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));
    }, [cardDistance, verticalDistance, skewAmount]);

    // Swap function triggered by the Next button
    const swap = useCallback(() => {
        const cards = cardsRef.current;
        if (isAnimating || order.current.length < 2) return;

        setIsAnimating(true);

        const [front, ...rest] = order.current;
        const elFront = cards[front];
        const tl = gsap.timeline({
            onComplete: () => {
                order.current = [...rest, front];
                setIsAnimating(false);
            }
        });
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
    }, [isAnimating, cardDistance, verticalDistance, config, easing]);

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
        <div className="flex flex-col items-center gap-6">
            <div
                ref={container}
                className="relative mx-auto h-full origin-center perspective-[900px] overflow-visible max-[768px]:scale-[0.8] max-[480px]:scale-[0.62]"
                style={{ width, height }}
            >
                {rendered}
            </div>

            {/* Next Button */}
            <button
                type="button"
                onClick={swap}
                disabled={isAnimating}
                className="group relative z-20 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--tone-gold)] hover:shadow-[0_8px_24px_rgba(245,166,35,0.15)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
                <span>Next</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default CardSwap;
