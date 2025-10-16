# Comparison of Self-Supervised Learning Methods for Spatial Transcriptomics Analysis

**A systematic evaluation of 8 SSL methods with 3 GNN architectures on mouse brain spatial transcriptomics data**

---

## 1. Introduction

### 1.1 The Data

At the very beginning, as a proof-of-concept test, I analyzed spatial transcriptomics data from the **SiT Mouse Brain dataset** (CBS1_illu) by [Lebrigand K, Bergenstråhle J, Thrane K, Mollbrink A et al. The spatial landscape of gene expression isoforms in tissue sections. Nucleic Acids Res 2023 May 8;51(8):e47.](https://doi.org/10.1093/nar/gkad169), which captures gene expression patterns with spatial context from mouse brain samples. The dataset comprises:

- **2,560 spatial spots** representing distinct tissue locations
- **31,053 genes**, filtered to **3,000 highly variable genes (HVGs)** for computational efficiency
- **Spatial coordinates** (imagerow, imagecol) preserving tissue architecture
- **13 annotated cell types/regions**: CA1/CA2, CA3, DG (Dentate Gyrus), Fiber tracts, Hippocampus area, Hypothalamus, Isocortex-1, Isocortex-2, Midbrain, Olfactory area, Outside, Retrosplenial area, and Thalamus

This dataset represents a coronal section of the mouse brain, providing rich biological complexity for evaluating representation learning methods.

### 1.2 The Problem

**Key Challenge**: Learning meaningful representations from spatial transcriptomics data that:
1. Capture biological cell type identities
2. Preserve spatial organization and tissue architecture
3. Enable downstream analysis (clustering, visualization, spatial domain identification)

Spatial transcriptomics data presents unique challenges:
- **High dimensionality**: Thousands of genes per spot
- **Spatial structure**: Expression patterns are spatially autocorrelated
- **Sparsity**: Gene expression counts are often sparse
- **Biological variability**: Complex tissue heterogeneity

**Research Question**: How do different self-supervised learning (SSL) approaches perform when combined with graph neural networks (GNNs) for learning spatial transcriptomics representations?

---

## 2. Methods

### 2.1 Graph Neural Networks (GNNs)

To build the graph as we [mention before](https://www.xinyuguo.com/projects/gnn-spatial-transcriptomics), I constructed a **k-nearest neighbor (k-NN) spatial graph** (k=8) based on Euclidean distances between spot coordinates, resulting in an undirected graph with **2,560 nodes** and **40,960 edges**. This graph captures the local spatial relationships between neighboring spots.

Three GNN architectures were evaluated as encoder backbones:

1. **GraphSAGE (SAGEConv)**: Samples and aggregates features from neighbors using mean pooling
2. **Graph Attention Networks (GATConv)**: Learns attention weights to weigh neighbor importance (4 attention heads in this case)
3. **Graph Convolutional Networks (GCNConv)**: Applies spectral graph convolutions for feature aggregation

**Architecture specifications**:
- 2 GNN layers (as we tested, 2 layers are sufficient for fitting this dataset)
- Hidden dimension: 256
- Projection dimension: 64 (for SSL methods)
- Batch normalization and dropout (0.1) between layers

### 2.2 Self-Supervised Learning (SSL) Methods

We compared **8 state-of-the-art SSL methods** across different families:

#### Contrastive Learning Methods:
1. **SimCLR**: Simple Framework for Contrastive Learning using NT-Xent loss (temperature=0.2)
2. **MoCo**: Momentum Contrast with a queue of negative samples (queue size=4096, momentum=0.99)
3. **SwAV**: Swapping Assignments between Views using optimal transport (512 prototypes)

#### Momentum-based Methods:
4. **BYOL**: Bootstrap Your Own Latent without negative pairs (momentum=0.99)
5. **SimSiam**: Simple Siamese Networks with stop-gradient

#### Reconstruction-based Methods:
6. **MAE**: Masked Autoencoder reconstructing masked gene expressions (mask ratio=0.75)

#### Redundancy Reduction Methods:
7. **Barlow Twins**: Self-supervised learning via redundancy reduction (λ=0.005)
8. **VICReg**: Variance-Invariance-Covariance Regularization (λ_inv=25, λ_var=25, λ_cov=1)

**Data Augmentation**: Two augmented views were created for each sample using:
- Gene dropout (10% of genes randomly masked)
- Gaussian noise addition (scale=0.005)

**Training Configuration**:
- 20 epochs
- Batch size: 256
- Optimizer: AdamW (learning rate=1e-4, weight decay=1e-5)
- Neighbor sampling: [8, 8] per hop

### 2.3 Evaluation Metrics

We evaluated representations using **24 method-backbone combinations** (8 SSL methods × 3 GNN backbones) across five complementary metrics:

#### Clustering Quality (Agreement with Ground Truth):
1. **AMI (Adjusted Mutual Information)**: Measures clustering agreement adjusted for chance (higher is better, range: [0, 1])
2. **NMI (Normalized Mutual Information)**: Normalized measure of shared information between clusterings (higher is better, range: [0, 1])

#### Internal Clustering Quality:
3. **Silhouette Score**: Measures cluster cohesion and separation without ground truth (higher is better, range: [-1, 1])

#### Spatial Autocorrelation:
4. **Moran's I**: Global spatial autocorrelation statistic, averaged across embedding dimensions (higher indicates stronger spatial coherence)
5. **Geary's C**: Alternative spatial autocorrelation measure (lower indicates stronger spatial coherence, range: [0, 2])

**Important Note**: These evaluation metrics provide a **partial view** of model performance and should not be considered exhaustive. Key limitations include:
- Clustering metrics (AMI/NMI) assume known ground truth as the cell types, where the model could identify sub-type level information
- Spatial metrics may not capture all biologically relevant patterns
- Metrics do not evaluate:
  - Robustness to batch effects
  - Transferability to downstream tasks
  - Biological interpretability of learned features
  - Computational efficiency and scalability
  - Performance on rare cell types or boundary regions

Additional evaluations on diverse datasets and downstream tasks are recommended for comprehensive assessment.

---

## 3. Results

### 3.1 Overview of Method Differences

We evaluated **24 method-backbone combinations** across five complementary metrics. The results reveal substantial differences in how each approach learns representations, though it's important to note that **these metrics provide limited insight** into actual biological utility or general representation quality.

**Particularly Interesting Observation**: **BYOL with SAGEConv** shows a compelling balance of properties:
- Moderate clustering agreement (AMI=0.510, NMI=0.516)
- Reasonable internal consistency (Silhouette=0.254)
- Balanced spatial autocorrelation (Moran's I=0.683, Geary's C=0.313)
- Achieved with the simplest GNN architecture (SAGEConv)
- Suggests potential for computational efficiency without sacrificing representation quality

This combination is particularly promising for further investigation as it doesn't rely on spectral graph operations (GCNConv) yet maintains reasonable performance across diverse metrics.

### 3.2 Differences Across SSL Methods

Average behavior across all three GNN backbones (mean ± std):

| Method | AMI | NMI | Silhouette | Moran's I | Geary's C |
|--------|---------|---------|----------------|---------------|---------------|
| VICReg | 0.566±0.095 | 0.572±0.094 | 0.283±0.023 | 0.847±0.072 | 0.153±0.070 |
| Barlow Twins | 0.558±0.036 | 0.563±0.036 | 0.266±0.024 | 0.855±0.092 | 0.145±0.091 |
| SwAV | 0.529±0.047 | 0.536±0.046 | 0.269±0.042 | 0.830±0.108 | 0.172±0.106 |
| **BYOL** | **0.524±0.023** | **0.531±0.023** | **0.271±0.027** | **0.819±0.121** | **0.184±0.116** |
| MoCo | 0.515±0.067 | 0.522±0.066 | 0.184±0.027 | 0.781±0.151 | 0.224±0.148 |
| SimCLR | 0.506±0.022 | 0.513±0.022 | 0.186±0.033 | 0.791±0.130 | 0.210±0.129 |
| SimSiam | 0.479±0.016 | 0.486±0.016 | 0.247±0.018 | 0.809±0.120 | 0.187±0.119 |
| MAE | 0.256±0.018 | 0.265±0.018 | 0.328±0.006 | 0.806±0.097 | 0.189±0.096 |

**Observed Patterns** (noting that these metrics may not capture actual representation quality):

1. **Redundancy reduction methods** (VICReg, Barlow Twins) show higher AMI/NMI values and more consistent behavior across backbones (lower std)

2. **BYOL demonstrates remarkable consistency** (std=0.023 for AMI) across different GNN architectures, suggesting its momentum-based approach is robust to architectural choices

3. **MAE exhibits a paradox**: Highest Silhouette scores (0.328) but lowest clustering agreement (AMI=0.256). This suggests it learns internally coherent representations that don't align with the provided annotations - which may reflect limitations in either the metric or the annotations themselves. Also, from the figures below in 3.4, we can see the outcome clusters could be noisy. 

4. **High variance in spatial metrics**: Methods show substantial variability in Moran's I (std up to 0.151 for MoCo), indicating strong interaction effects with GNN backbone choice

### 3.3 Differences Across GNN Backbones

Average behavior across all eight SSL methods:

| Backbone | AMI | NMI | Silhouette | Moran's I | Geary's C |
|----------|---------|---------|----------------|---------------|---------------|
| GCNConv | 0.507±0.107 | 0.513±0.106 | 0.272±0.048 | 0.909±0.007 | 0.092±0.008 |
| GATConv | 0.458±0.079 | 0.465±0.078 | 0.257±0.047 | 0.848±0.030 | 0.154±0.030 |
| **SAGEConv** | **0.510±0.124** | **0.517±0.122** | **0.233±0.058** | **0.695±0.052** | **0.303±0.053** |

**Notable Differences**:

1. **GCNConv shows very low variance in spatial metrics** (std=0.007 for Moran's I), suggesting spectral graph operations impose strong spatial smoothing regardless of SSL method

2. **SAGEConv exhibits interesting trade-offs**:
   - Comparable AMI/NMI to GCNConv (0.510 vs. 0.507)
   - Lower spatial autocorrelation metrics (Moran's I=0.695 vs. 0.909)
   - **Highest variance across methods** (std=0.124), indicating SSL objective matters more for this backbone
   - This divergence between clustering agreement and spatial coherence suggests different information capture

3. **GATConv sits intermediate** with moderate values across all metrics

**Important Caveat**: The strong spatial smoothing in GCNConv may be an artifact of the spectral operations rather than learned biological structure. SAGEConv's lower Moran's I might indicate it preserves local heterogeneity that GCNConv over-smooths.

### 3.4 Spatial Visualization Analysis

Representative spatial clustering visualizations reveal substantial qualitative differences:

(here, we plot clustering result for each backbone across all methods)
![SAGEConv](/projects/sit_explore/SAGEConv.jpeg)
*Figure 1: Leiden clustering results visualized in tissue space for all 24 method-backbone combinations*

![GATConv](/projects/sit_explore/GATConv.jpeg)
*Figure 1: Leiden clustering results visualized in tissue space for all 24 method-backbone combinations*

![GCNConv](/projects/sit_explore/GCNConv.jpeg)
*Figure 1: Leiden clustering results visualized in tissue space for all 24 method-backbone combinations*

**Qualitative Observations** (with caution about subjective interpretation):

**SAGEConv-based methods** tend to produce:
- More fragmented spatial patterns
- Higher cluster counts (up to 22)
- Sharper local transitions
- **Potentially preserving fine-grained local heterogeneity** that other methods smooth away

**BYOL-SAGEConv specifically** shows:
- Balanced cluster granularity (19 clusters)
- Mixture of smooth regions and local detail
- Reasonable correspondence to anatomical structures without over-smoothing

**GCNConv-based methods** generally show:
- More spatially contiguous clusters
- Smoother boundaries between regions
- Fewer, larger clusters (often 13-20)
- Strong delineation along major anatomical boundaries

**Critical Note**: Visual "quality" is subjective. What appears as "over-fragmentation" might be biologically meaningful local variation. What appears as "clean boundaries" might be artificial smoothing.

### 3.5 Metric Relationships

![Metric Scatter Plots](SSL_Comparison_Results/metrics_scatterplots.png)
*Figure 3: Relationships between clustering quality and spatial coherence metrics*

**Observed Correlations** (with important limitations):

1. **AMI vs. Moran's I**: Appear positively correlated (ρ≈0.75)
   - However, this may reflect GCNConv's strong influence on both metrics
   - SAGEConv methods show comparable AMI with lower Moran's I
   - **Interpretation challenge**: Does high Moran's I indicate good spatial structure or excessive smoothing?

2. **NMI vs. Geary's C**: Show negative correlation (ρ≈-0.78)
   - Could indicate spatial coherence aids clustering
   - Or could reflect that both metrics favor smooth, homogeneous regions
   - Ground truth annotations themselves may be spatially correlated

3. **Silhouette vs. Moran's I**: Weak negative correlation
   - MAE achieves high Silhouette but moderate Moran's I
   - Suggests these metrics capture different aspects of representation structure
   - Internal consistency (Silhouette) vs. spatial smoothness (Moran's I) may be orthogonal qualities

### 3.6 Method Family Patterns

![Method Comparison](SSL_Comparison_Results/method_comparison.png)
*Figure 4: Average performance by SSL method across clustering and spatial metrics*

![Backbone Comparison](SSL_Comparison_Results/backbone_comparison.png)
*Figure 5: Average performance by GNN backbone across metrics*

**Grouping by approach** reveals different behaviors:

1. **Redundancy Reduction (VICReg, Barlow Twins)**:
   - Show higher AMI/NMI values on average
   - Lower variance across backbones
   - **Theoretical advantage**: Explicit decorrelation prevents collapse without requiring negative pairs
   - **Potential limitation**: May over-regularize and lose fine-grained distinctions

2. **Contrastive Learning (SimCLR, MoCo, SwAV)**:
   - Show moderate values with higher variance
   - More sensitive to backbone and hyperparameter choices
   - **Theoretical advantage**: Learn discriminative features through direct comparison
   - **Potential limitation**: May prioritize augmentation-invariance over spatial structure

3. **Momentum-based (BYOL, SimSiam)**:
   - **BYOL shows remarkable consistency** across architectures
   - Lower variance suggests robust learning dynamics
   - **Theoretical advantage**: Avoid collapse without negatives, simpler than contrastive methods
   - **Potential limitation**: May lack strong discriminative pressure

4. **Reconstruction (MAE)**:
   - Highest Silhouette, lowest AMI/NMI
   - **Theoretical advantage**: Direct reconstruction objective is intuitive and stable
   - **Potential limitation**: Local pattern reconstruction may not capture cell type-level semantics

---

## 4. Discussion and Insights

### 4.1 Critical Limitations of This Study

Before interpreting results, it's essential to acknowledge **fundamental limitations** that constrain our conclusions:

**Evaluation Limitations**:
1. **Metrics are proxies, not ground truth**:
   - AMI/NMI assume the 13 annotated regions are the "correct" clustering
   - Annotations may be incomplete, subjective, or overly coarse
   - Silhouette score can be high for arbitrary clusterings
   - Moran's I can reflect over-smoothing rather than biological coherence

2. **Single dataset, single tissue type**:
   - Mouse brain has specific spatial organization patterns
   - Results may not generalize to other tissues (liver, tumor, etc.)
   - No cross-validation on independent datasets

3. **Limited exploration of hyperparameter space**:
   - Only 20 epochs (methods may not have converged)
   - Fixed augmentation parameters (gene dropout=0.1, noise=0.005)
   - Fixed architecture sizes (hidden=256, projection=64)
   - Different methods may require different hyperparameter regimes

4. **No downstream task evaluation**:
   - We don't test on actual biological questions (differential expression, trajectory inference, cell-cell communication)
   - Representations optimized for clustering may fail at other tasks
   - No assessment of rare cell type detection or boundary region performance

5. **Computational constraints**:
   - Small dataset (2,560 spots) may not reveal scalability issues
   - Cannot evaluate batch correction or transfer learning

**Therefore, the metrics in this study primarily serve to identify differences in learned representations, not to definitively rank method quality.**

### 4.2 What Constitutes a "Good" Representation?

This question lacks a clear answer and depends on the intended application:

**Different objectives may favor different properties**:

1. **For cell type classification**: High AMI/NMI with annotations
   - But assumes annotations are complete and correct
   - May favor methods that memorize annotation patterns rather than learn generalizable features

2. **For spatial domain identification**: High Moran's I, low Geary's C
   - But can be achieved through over-smoothing
   - May erase biologically meaningful local heterogeneity

3. **For clustering consistency**: High Silhouette scores
   - But can be high for meaningless clusterings
   - Doesn't guarantee biological relevance

4. **For preserving local variation**: Lower Moran's I, fragmented clusters
   - May capture microenvironmental differences
   - Could also reflect noise or over-sensitivity to local fluctuations

**BYOL-SAGEConv's balanced profile** is interesting precisely because it doesn't maximize any single metric but maintains moderate values across all, potentially indicating a representation that doesn't over-optimize for any particular bias in the evaluation framework.

### 4.3 Theoretical Considerations for Each Approach

**Redundancy Reduction (VICReg, Barlow Twins)**:

*Potential Advantages*:
- Explicit decorrelation prevents dimensional collapse without negative pairs
- Theoretically elegant: directly optimize for feature diversity
- May be more stable than contrastive learning (no sensitivity to negative sampling)
- Lower computational cost (no momentum network or queue)

*Potential Disadvantages*:
- Strong decorrelation may destroy naturally correlated biological features
- Variance regularization could suppress detection of rare cell types
- May over-smooth local heterogeneity to achieve global decorrelation
- Theoretical guarantees assume i.i.d. data, but spatial data violates this

**Contrastive Learning (SimCLR, MoCo, SwAV)**:

*Potential Advantages*:
- Strong discriminative learning through direct comparison
- Proven success in computer vision suggests transferable principles
- SwAV's clustering approach may naturally align with spatial domains
- MoCo's queue provides diverse negatives

*Potential Disadvantages*:
- Augmentation-invariance may conflict with spatial structure preservation
- Requires careful negative sampling (what should be "different" in spatial data?)
- Sensitive to temperature and queue size hyperparameters
- May prioritize global distinctions over local gradients

**Momentum-based (BYOL, SimSiam)**:

*Potential Advantages*:
- **No negative pairs needed** - avoids defining "dissimilar" samples
- BYOL's momentum encoder provides stable learning targets
- Simpler than contrastive methods, fewer hyperparameters
- May naturally preserve local structure (no push-apart signals)

*Potential Disadvantages*:
- Weaker discriminative pressure than contrastive methods
- Relies on asymmetric architecture for collapse prevention
- Target network may lag behind online network, learning outdated features
- Unclear why collapse doesn't occur (theoretical understanding incomplete)

**Reconstruction (MAE)**:

*Potential Advantages*:
- Directly learns to predict gene expression - interpretable objective
- No collapse risk (reconstruction is well-posed)
- May capture gene co-expression patterns and regulatory relationships
- Could preserve all information (unlike compression-based methods)

*Potential Disadvantages*:
- Reconstruction ≠ useful abstraction (may learn pixel-level details)
- Heavy masking (75%) may lose global context
- Doesn't explicitly encourage discriminative features
- May focus on high-variance genes rather than cell type markers

### 4.4 GNN Backbone Trade-offs

**GCNConv (Spectral Graph Convolution)**:

*Observed*: High Moran's I, low variance across SSL methods

*Interpretation*:
- Spectral operations inherently smooth features over graph structure
- May be beneficial if spatial smoothness is desired
- May be problematic if local heterogeneity is important
- Low variance suggests SSL objective matters less (backbone dominates)

**SAGEConv (GraphSAGE)**:

*Observed*: Comparable AMI to GCNConv, much lower Moran's I, high variance across SSL methods

*Interpretation*:
- Mean aggregation preserves local feature diversity
- Higher variance indicates SSL objective significantly influences results
- May better preserve fine-grained spatial patterns
- Could be more suitable for detecting local microenvironments

**GATConv (Graph Attention)**:

*Observed*: Intermediate on all metrics

*Interpretation*:
- Learned attention weights add flexibility
- May adapt to local structure (unlike fixed GCNConv)
- More parameters may need more training or data
- Attention may focus on feature similarity rather than spatial proximity

**The "best" backbone depends on the application**: GCNConv if you want smooth spatial domains, SAGEConv if you want to preserve local heterogeneity.

### 4.5 Potential Hybrid Approaches

Given the different strengths of each method family, **combining approaches** may be promising:

**SimCLR + Barlow Twins (Contrastive + Redundancy Reduction)**:

*Rationale*:
- SimCLR provides discriminative learning through contrastive loss
- Barlow Twins' decorrelation prevents feature redundancy
- Combined loss: L = L_contrastive + λ * L_BarlowTwins
- May achieve both strong discrimination and feature diversity

*Potential benefits*:
- Stronger discriminative features than pure redundancy reduction
- More stable than pure contrastive learning
- Feature diversity prevents collapse without careful negative sampling

*Implementation considerations*:
- Need to balance loss weights (λ hyperparameter)
- May be computationally expensive (two loss terms)
- Augmentation strategy affects both objectives

**Other promising combinations**:
- **BYOL + VICReg**: Momentum-based stability + explicit decorrelation
- **MAE + Contrastive**: Reconstruction + discrimination
- **SwAV + Spatial regularization**: Clustering + explicit spatial smoothness term

---

## 5. Conclusions

This exploratory comparison of 8 self-supervised learning methods across 3 GNN architectures reveals substantial differences in how representations are learned, though **definitive conclusions about method superiority are premature** given the limitations in evaluation.

**Key Observations**:

1. 🔍 **Substantial method-backbone interactions**: The same SSL method behaves very differently depending on GNN backbone, with variance up to 0.124 in AMI

2. 🔍 **BYOL-SAGEConv shows promise**: Achieves balanced performance across metrics without over-optimizing for any single one, suggesting potential for further investigation

3. ⚠️ **GCNConv's high spatial coherence may be double-edged**: While achieving high Moran's I, it may over-smooth local heterogeneity

4. 🤔 **MAE's paradox highlights evaluation challenges**: High Silhouette but low AMI suggests metrics capture different aspects of representation quality

5. 💡 **Redundancy reduction methods show consistency**: Lower variance across backbones suggests more robust learning dynamics

6. 🧪 **Hybrid approaches warrant exploration**: Combining contrastive learning (SimCLR) with redundancy reduction (Barlow Twins) could leverage complementary strengths

**What This Study Provides**:
- Systematic comparison revealing method differences
- Identification of method-backbone interaction effects
- Motivation for BYOL-SAGEConv as a promising direction
- Framework for hybrid approach development

**What This Study Does NOT Provide**:
- Definitive ranking of method quality
- Biological validation of learned representations
- Generalization to other tissues or datasets
- Guidance for downstream task performance

---

## 6. Future Directions

### 6.1 To Be Continued: Cross-Tissue Validation with Larger Datasets

The current study's single-dataset limitation is its most critical weakness. **Essential next steps** include:

**1. MOSTA Developmental Atlas (E9.5 - E16.5)**:
- Evaluate on mouse embryonic stages covering organogenesis
- Test if methods generalize across developmental time
- Assess if representations capture developmental trajectories
- Available in `/MOSTA/` directory with stages: E9.5, E10.5, E11.5, E12.5, E13.5, E14.5, E15.5, E16.5

**2. Cross-Tissue Generalization**:
- Non-neural tissues: liver, heart, kidney (different spatial organization)
- Tumor microenvironments: heterogeneous, no clear anatomical structure
- Test if brain-trained models transfer to other tissues
- Identify tissue-specific vs. universal representation properties

**3. Larger Dataset Evaluation**:
- Current dataset: 2,560 spots
- Need datasets with 10,000+ spots to assess scalability
- Test computational efficiency and memory requirements
- Evaluate if patterns observed here hold at scale

**4. Biological Validation**:
Must go beyond clustering metrics:
- Differential gene expression analysis between learned clusters
- Pathway enrichment (do clusters correspond to biological processes?)
- Rare cell type recovery (currently unmeasured)
- Cell-cell communication analysis using learned representations
- Spatial trajectory inference quality

### 6.2 Hybrid Method Development

Based on theoretical considerations, priority investigations:

**1. SimCLR + Barlow Twins**:
- Implement combined loss: L = L_NT-Xent + λ_BT * L_BarlowTwins
- Systematic grid search over λ_BT ∈ [0.001, 0.01, 0.1]
- Test on BYOL-SAGEConv's favorable balanced behavior

**2. BYOL + VICReg**:
- Add VICReg's variance/covariance terms to BYOL's predictor objective
- May provide explicit collapse prevention mechanism
- Could improve BYOL's theoretical understanding

**3. Spatial-aware SSL**:
- Add explicit spatial regularization term to existing methods
- L_total = L_SSL + λ_spatial * L_spatial_smoothness
- Test whether explicit spatial term improves over implicit (GNN-based) spatial encoding

### 6.3 Open Questions

**Critical unanswered questions**:
1. Why does BYOL-SAGEConv show such balanced behavior?
2. Can we design metrics that better reflect biological utility?
3. How do methods perform on rare cell types (not measured here)?
4. What is the minimal dataset size needed for each method?
5. Can we predict which method suits a given tissue type *a priori*?

### 6.4 Practical Next Steps

**Immediate priorities**:
1. ✅ Run evaluation on MOSTA E11.5 dataset (larger, different tissue organization)
2. ✅ Implement SimCLR+BarlowTwins hybrid
3. ✅ Develop biological validation pipeline (marker genes, pathways)
4. ✅ Compare to non-SSL baselines (PCA, scVI, Seurat)
5. ⬜ Test downstream task performance (DE analysis, trajectory inference)

---

## Acknowledgments

This analysis leveraged:
- **SiT Mouse Brain dataset** for spatial transcriptomics data
- **PyTorch Geometric** for GNN implementations
- **Scanpy** for preprocessing and visualization
- **Scikit-learn** for evaluation metrics

---

## References

**SSL Methods**:
1. Chen et al. (2020) - SimCLR: A Simple Framework for Contrastive Learning
2. He et al. (2020) - MoCo: Momentum Contrast for Unsupervised Visual Representation Learning
3. Grill et al. (2020) - BYOL: Bootstrap Your Own Latent
4. Caron et al. (2020) - SwAV: Unsupervised Learning of Visual Features by Contrasting Cluster Assignments
5. Chen & He (2021) - SimSiam: Exploring Simple Siamese Representation Learning
6. He et al. (2022) - MAE: Masked Autoencoders Are Scalable Vision Learners
7. Zbontar et al. (2021) - Barlow Twins: Self-Supervised Learning via Redundancy Reduction
8. Bardes et al. (2022) - VICReg: Variance-Invariance-Covariance Regularization

**GNN Architectures**:
1. Hamilton et al. (2017) - GraphSAGE: Inductive Representation Learning on Large Graphs
2. Veličković et al. (2018) - GAT: Graph Attention Networks
3. Kipf & Welling (2017) - GCN: Semi-Supervised Classification with Graph Convolutional Networks

**Spatial Transcriptomics**:
1. Rao et al. (2021) - Exploring tissue architecture using spatial transcriptomics
2. Moses & Pachter (2022) - Museum of spatial transcriptomics
3. Pham et al. (2024) - SiT: Spatial integration of transcriptomic data

---

**Contact**: For questions or collaborations, please refer to the repository.

**Last Updated**: 2025-10-15
