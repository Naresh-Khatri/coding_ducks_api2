import sys
import os
import cv2
import numpy as np
from skimage.metrics import structural_similarity

[foo, path] = sys.argv
print(foo, path)

target = cv2.imread(os.path.join(path, "target.png"))
output = cv2.imread(os.path.join(path, "output.png"))
# print(target)

# Convert images to grayscale
target_gray = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
output_gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)

# Compute SSIM between two images
(_, diff) = structural_similarity(target_gray, output_gray, full=True)

# The diff image contains the actual image differences between the two images
# and is represented as a floating point data type in the range [0,1]
# so we must convert the array to 8-bit unsigned integers in the range
# [0,255] before we can use it with OpenCV
diff = (diff * 255).astype("uint8")

# Threshold the difference image, followed by finding contours to
# obtain the regions of the two input images that differ
thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
contours = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = contours[0] if len(contours) == 2 else contours[1]

mask = np.zeros(target.shape, dtype="uint8")
filled_output = output.copy()

for c in contours:
    area = cv2.contourArea(c)
    if area > 40:
        x, y, w, h = cv2.boundingRect(c)
        cv2.rectangle(target, (x, y), (x + w, y + h), (36, 255, 12), 2)
        cv2.rectangle(output, (x, y), (x + w, y + h), (36, 255, 12), 2)
        cv2.drawContours(mask, [c], 0, (0, 255, 0), -1)
        cv2.drawContours(filled_output, [c], 0, (0, 255, 0), -1)

cv2.imwrite(os.path.join(path, "target_contours.png"), target)
cv2.imwrite(os.path.join(path, "output_contours.png"), output)
cv2.imwrite(os.path.join(path, "diff.png"), diff)
cv2.imwrite(os.path.join(path, "mask.png"), mask)
cv2.imwrite(os.path.join(path, "filled_output.png"), filled_output)
