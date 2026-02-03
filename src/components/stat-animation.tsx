import { useEffect, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  index:number
}


const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, duration = 2,index }) => {
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 1,
    rootMargin: '-20% 0px'
  });
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const animation = animate(count, target, {
        duration: duration,
        ease: "easeOut",
      });

      return animation.stop;
    }
  }, [inView, target, count]);

  return (
    <div>
      <motion.em className='not-italic text-[4em] relative before:w-full before:h-[0.1875rem] before:bg-thirty before:absolute before:left-[0.3125rem] before:bottom-0 w-fit' ref={ref}>{rounded}</motion.em>
      <em>{(index === 2 ? 'Jours' : index === 3 ? '€' : '')}</em>
    </div>
  );
};

export default AnimatedCounter;