import sys
import os
import cv2
import numpy as np
import phasepack.phasecong as pc
from image_similarity_measures.quality_metrics import fsim as fsimm
from time import perf_counter

[foo, path] = sys.argv
print(foo, path)
print("generating scores")
target = cv2.imread(os.path.join(path, "target.png"))
output = cv2.imread(os.path.join(path, "output.png"))


def _gradient_magnitude(img: np.ndarray, img_depth: int):
    """
    Calculate gradient magnitude based on Scharr operator.
    """
    scharrx = cv2.Scharr(img, img_depth, 1, 0)
    scharry = cv2.Scharr(img, img_depth, 0, 1)

    return np.sqrt(scharrx**2 + scharry**2)


def _similarity_measure(x: np.array, y: np.array, constant: float):
    """
    Calculate feature similarity measurement between two images
    """
    numerator = 2 * x * y + constant
    denominator = x**2 + y**2 + constant

    return numerator / denominator


start = perf_counter()


def fsim(img1: np.ndarray, img2: np.ndarray, T1: float = 0.85, T2: float = 160):
    """
    Feature-based similarity index, based on phase congruency (PC) and image gradient magnitude (GM)
    Args:
        img1 -- original image
        img2 -- image to be compared
        T1 -- constant based on the dynamic range of PC values
        T2 -- constant based on the dynamic range of GM values
    """
    alpha = beta = (
        1  # parameters used to adjust the relative importance of PC and GM features
    )
    fsim_list = []
    for i in range(img1.shape[2]):
        # Calculate the PC for original and predicted images
        pc1_2dim = pc(img1[:, :, i], nscale=4, minWaveLength=6, mult=2, sigmaOnf=0.5978)
        pc2_2dim = pc(img2[:, :, i], nscale=4, minWaveLength=6, mult=2, sigmaOnf=0.5978)

        # pc1_2dim and pc2_2dim are tuples with the length 7, we only need the 4th element which is the PC.
        # The PC itself is a list with the size of 6 (number of orientation). Therefore, we need to
        # calculate the sum of all these 6 arrays.
        pc1_2dim_sum = np.zeros((img1.shape[0], img1.shape[1]), dtype=np.float64)
        pc2_2dim_sum = np.zeros((img2.shape[0], img2.shape[1]), dtype=np.float64)
        for orientation in range(6):
            pc1_2dim_sum += pc1_2dim[4][orientation]
            pc2_2dim_sum += pc2_2dim[4][orientation]

        # Calculate GM for original and predicted images based on Scharr operator
        gm1 = _gradient_magnitude(img1[:, :, i], cv2.CV_16U)
        gm2 = _gradient_magnitude(img2[:, :, i], cv2.CV_16U)

        # Calculate similarity measure for PC1 and PC2
        S_pc = _similarity_measure(pc1_2dim_sum, pc2_2dim_sum, T1)
        # Calculate similarity measure for GM1 and GM2
        S_g = _similarity_measure(gm1, gm2, T2)

        S_l = (S_pc**alpha) * (S_g**beta)

        numerator = np.sum(S_l * np.maximum(pc1_2dim_sum, pc2_2dim_sum))
        denominator = np.sum(np.maximum(pc1_2dim_sum, pc2_2dim_sum))
        fsim_list.append(numerator / denominator)

    return np.mean(fsim_list)


# Compute FSIM score between two images
score = fsim(img1=target, img2=output)
# score = fsimm(org_img=target, pred_img=output)
print("score:", score)
print(perf_counter() - start, "generated")

# custom 1.8gb
# new: 23   32   33     41     39   36
#      12   20   21     29     28   24
# custom
# new: 19   19   19
#      10   9     9

# lib 1.8gb
# old: 32   33   31     43     31   36
#      20   20   19     26     18   30
# lib 2.5gb
# old: 23   19   18     19     19   19
#      12   9     9     9      9    9
# lib no limit
# old: 22   18   19     19     19   19
#      10   9     9     9      9    9
