import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { hsvToHex } from './colorUtils';

type Props = {
  onChange: (hex: string) => void;
};

const SIZE = 260;
const POINTER_SIZE = 18;

export default function SimpleColorPicker({ onChange }: Props) {
    const [color, setColor] = useState('#ff0000');
    const [pointer, setPointer] = useState({ x: SIZE / 2, y: SIZE / 2 });


    function handleTouch(x: number, y: number) {
        const px = Math.max(0, Math.min(SIZE, x));
        const py = Math.max(0, Math.min(SIZE, y));

        const hue = (px / SIZE) * 360;
        const sat = 100 - (py / SIZE) * 100;

        const hex = hsvToHex(hue, sat, 100);

        setPointer({ x: px, y: py });
        setColor(hex);
        onChange(hex);
    }


    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                handleTouch(locationX, locationY);
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                handleTouch(locationX, locationY);
            },
        })
    ).current;


  return (
    <View style={styles.wrapper}>
        {/* GRADE VISUAL (não recebe touch) */}
        <View style={styles.picker}>
            {Array.from({ length: 20 }).map((_, row) => (
            <View key={row} style={{ flexDirection: 'row', flex: 1 }}>
                {Array.from({ length: 20 }).map((_, col) => {
                    const h = (col / 20) * 360;
                    const s = 100 - (row / 20) * 100;
                    const hex = hsvToHex(h, s, 100);

                    return (
                        <View
                        key={col}
                        style={{ flex: 1, backgroundColor: hex }}
                        />
                    );
                })}
            </View>
            ))}
        </View>

        {/* CAMADA DE TOUCH */}
        <View
            style={styles.touchLayer}
            {...panResponder.panHandlers}
        />

        {/* POINTER */}
        <View
            pointerEvents="none"
            style={[
                styles.pointer,
                {
                    left: pointer.x - POINTER_SIZE / 2,
                    top: pointer.y - POINTER_SIZE / 2,
                    borderColor: color,
                },
            ]}
        />
    </View>
  );
}

const styles = StyleSheet.create({
    wrapper: {
        width: SIZE,
        height: SIZE,
    },
  picker: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  pointer: {
    position: 'absolute',
    width: POINTER_SIZE,
    height: POINTER_SIZE,
    borderRadius: POINTER_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  preview: {
    height: 40,
    marginTop: 6,
    borderRadius: 8,
  },
  touchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    backgroundColor: 'transparent',
  },
  previewText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  hex: {
    marginTop: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
