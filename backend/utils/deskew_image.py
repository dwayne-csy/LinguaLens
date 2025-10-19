# deskew_image.py - IMPROVED for slight tilts
#!/usr/bin/env python3
import cv2
import numpy as np
import sys
import os

def detect_tilt_angle(image):
    """More sensitive tilt detection for slight angles"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Use multiple methods for better accuracy
    angles = []
    
    # Method 1: Hough Lines
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=80)
    
    if lines is not None:
        for rho, theta in lines[:30]:
            angle = np.degrees(theta) - 90
            if -20 <= angle <= 20:  # Wider range for slight tilts
                angles.append(angle)
    
    # Method 2: MinAreaRect on text regions
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Use larger contours only
        large_contours = [c for c in contours if cv2.contourArea(c) > 100]
        if large_contours:
            main_contour = max(large_contours, key=cv2.contourArea)
            rect = cv2.minAreaRect(main_contour)
            angle = rect[-1]
            if angle < -45:
                angle = 90 + angle
            angles.append(-angle)
    
    if angles:
        # Use median to avoid outliers
        return np.median(angles)
    return 0

def deskew_image(input_path, output_path):
    """Deskew image with better slight tilt handling"""
    image = cv2.imread(input_path)
    if image is None:
        return 1
    
    # Detect tilt angle
    angle = detect_tilt_angle(image)
    
    # Deskew if angle is significant (even 1 degree)
    if abs(angle) > 0.5:
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        deskewed = cv2.warpAffine(image, rotation_matrix, (w, h), 
                                flags=cv2.INTER_CUBIC,
                                borderMode=cv2.BORDER_CONSTANT, 
                                borderValue=(255, 255, 255))
        cv2.imwrite(output_path, deskewed)
        print(f"Deskewed by {angle:.2f}Â°")
    else:
        cv2.imwrite(output_path, image)
    
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    sys.exit(deskew_image(input_path, output_path))



