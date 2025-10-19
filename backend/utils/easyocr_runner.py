# easyocr_runner.py - OPTIMIZED for tilted text
#!/usr/bin/env python3
import sys
import json
import easyocr
import cv2
import numpy as np
import os

def main(image_path, languages):
    try:
        # Initialize reader
        lang_list = [lang.strip() for lang in languages.split(',')]
        reader = easyocr.Reader(lang_list, gpu=False, verbose=False)
        
        # Read and preprocess image
        img = cv2.imread(image_path)
        if img is None:
            print(json.dumps({"text": "", "confidence": 0}))
            return 1
        
        # Simple preprocessing for tilted text
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast for better detection
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Run OCR with tilted-text optimized settings
        results = reader.readtext(
            enhanced,
            detail=1,
            paragraph=True,  # Better for tilted text
            text_threshold=0.4,
            low_text=0.3,
            link_threshold=0.4,
            slope_ths=0.3,    # More tolerant of slopes
            ycenter_ths=0.5,
            height_ths=0.7,
            width_ths=1.0,    # More tolerant of width variations
            decoder='beamsearch',
            beamWidth=3
        )
        
        if not results:
            print(json.dumps({"text": "", "confidence": 0}))
            return 1
        
        # Extract text
        text_parts = []
        confidences = []
        
        for bbox, text, confidence in results:
            text_clean = text.strip()
            if text_clean and confidence > 0.2:
                text_parts.append(text_clean)
                confidences.append(confidence)
        
        final_text = ' '.join(text_parts)
        avg_confidence = (sum(confidences) / len(confidences) * 100) if confidences else 0
        
        output = {
            "text": final_text,
            "confidence": round(avg_confidence, 2)
        }
        
        print(json.dumps(output, ensure_ascii=False))
        return 0
        
    except Exception as e:
        print(json.dumps({"error": str(e), "text": "", "confidence": 0}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python easyocr_runner.py <image_path> <languages>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    languages = sys.argv[2]
    sys.exit(main(image_path, languages))

