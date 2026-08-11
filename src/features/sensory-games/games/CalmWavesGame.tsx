import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';

import { createId } from '@shared/utils/id';

import type { CalmWavesMode } from '../types';

interface ModeConfig {
  background: string;
  rippleColor: string;
  ambientColor: string;
  ambientCount: number;
  ambientMinSize: number;
  ambientMaxSize: number;
}

const MODE_CONFIG: Record<CalmWavesMode, ModeConfig> = {
  water: {
    background: '#DCEFFA',
    rippleColor: '#4D96FF',
    ambientColor: '#BFE0F5',
    ambientCount: 5,
    ambientMinSize: 30,
    ambientMaxSize: 60,
  },
  stars: {
    background: '#262A4A',
    rippleColor: '#FFD93D',
    ambientColor: '#F4F1FF',
    ambientCount: 12,
    ambientMinSize: 4,
    ambientMaxSize: 9,
  },
  circles: {
    background: '#F3E9F7',
    rippleColor: '#B983FF',
    ambientColor: '#E3CFF2',
    ambientCount: 4,
    ambientMinSize: 70,
    ambientMaxSize: 130,
  },
  softLight: {
    background: '#FFF6E5',
    rippleColor: '#FFC93C',
    ambientColor: '#FFE8B8',
    ambientCount: 1,
    ambientMinSize: 180,
    ambientMaxSize: 180,
  },
};

interface Ripple {
  id: string;
  x: number;
  y: number;
}

interface AmbientDescriptor {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function RippleRing({ ripple, color, onDone }: { ripple: Ripple; color: string; onDone: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDone identity puede cambiar entre renders; solo debe iniciar la animación una vez, al montar este anillo.
  }, []);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          left: ripple.x - 70,
          top: ripple.y - 70,
          borderColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

function AmbientElement({ descriptor, color, reduceMotion }: { descriptor: AmbientDescriptor; color: string; reduceMotion: boolean }) {
  const [breathe] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3200,
          delay: descriptor.delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, descriptor.delay, reduceMotion]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ambient,
        {
          left: descriptor.x - descriptor.size / 2,
          top: descriptor.y - descriptor.size / 2,
          width: descriptor.size,
          height: descriptor.size,
          borderRadius: descriptor.size / 2,
          backgroundColor: color,
          transform: reduceMotion ? undefined : [{ scale }],
          opacity: reduceMotion ? 0.5 : opacity,
        },
      ]}
    />
  );
}

export interface CalmWavesGameProps {
  mode: CalmWavesMode;
  reduceMotion: boolean;
}

/** Fondo relajante; cada toque deja ondas concéntricas suaves. Sin objetivos ni puntuación. */
export function CalmWavesGame({ mode, reduceMotion }: CalmWavesGameProps) {
  const config = MODE_CONFIG[mode];
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [ambient, setAmbient] = useState<AmbientDescriptor[]>([]);
  const lastRippleAt = useRef(0);

  const layoutKey = `${area.width}x${area.height}x${mode}`;
  const [appliedLayoutKey, setAppliedLayoutKey] = useState('');
  if (area.width > 0 && area.height > 0 && layoutKey !== appliedLayoutKey) {
    setAppliedLayoutKey(layoutKey);
    setAmbient(
      Array.from({ length: config.ambientCount }).map(() => ({
        id: createId(),
        x: randomBetween(40, area.width - 40),
        y: randomBetween(40, area.height - 40),
        size: randomBetween(config.ambientMinSize, config.ambientMaxSize),
        delay: randomBetween(0, 2000),
      })),
    );
  }

  /* eslint-disable react-hooks/purity, react-hooks/refs --
     Los manejadores de PanResponder solo corren ante toques reales, nunca
     durante el render; ver la misma nota en MagicColorsGame. */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      addRipple(locationX, locationY);
    },
    onPanResponderMove: (event) => {
      const now = Date.now();
      if (now - lastRippleAt.current < 450) {
        return;
      }
      lastRippleAt.current = now;
      const { locationX, locationY } = event.nativeEvent;
      addRipple(locationX, locationY);
    },
  });

  function addRipple(x: number, y: number) {
    setRipples((current) => [...current, { id: createId(), x, y }]);
  }
  /* eslint-enable react-hooks/purity, react-hooks/refs */

  function removeRipple(id: string) {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }

  return (
    <View
      style={[styles.area, { backgroundColor: config.background }]}
      onLayout={(event) => setArea(event.nativeEvent.layout)}
      {...panResponder.panHandlers}
    >
      {ambient.map((descriptor) => (
        <AmbientElement key={descriptor.id} descriptor={descriptor} color={config.ambientColor} reduceMotion={reduceMotion} />
      ))}
      {ripples.map((ripple) => (
        <RippleRing key={ripple.id} ripple={ripple} color={config.rippleColor} onDone={() => removeRipple(ripple.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    overflow: 'hidden',
  },
  ambient: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
});
