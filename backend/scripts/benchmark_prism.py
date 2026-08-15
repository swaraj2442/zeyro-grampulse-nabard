"""Prism V4 Calibration and Statistical Validation Benchmark.

Simulates an underwriting population of N=5000 applicant profiles using
domain-constrained random feature vectors, maps them through the scoring modules,
and evaluates performance metrics (Score distribution, default rate monotonicity,
and KS-separation metrics).
"""

import sys
import os
import math
from collections import defaultdict

# Add path to include scoring modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../python')))

from scoring import compute_bfs, compute_rps, generate_random_fv

def run_benchmark(n_profiles: int = 5000):
    print(f"--- Running Prism V4 Benchmarking for N = {n_profiles} applicants ---")
    
    scores = []
    default_probabilities = []
    
    # Track statistics per band
    band_counts = defaultdict(int)
    band_probs = defaultdict(list)
    
    # 1. Evaluate population
    for i in range(n_profiles):
        fv = generate_random_fv(seed=i)
        bfs = compute_bfs(fv)
        rps = compute_rps(fv)
        
        scores.append(bfs.score)
        default_probabilities.append(1.0 - rps.probability) # probability of default (PD)
        
        band_counts[bfs.band] += 1
        band_probs[bfs.band].append(1.0 - rps.probability)
        
    # 2. General Population Stats
    mean_score = sum(scores) / n_profiles
    variance = sum((s - mean_score) ** 2 for s in scores) / n_profiles
    std_dev = math.sqrt(variance)
    
    print("\n[Population Distribution Stats]")
    print(f"Mean Score: {mean_score:.2f} (Target: 600 - 620)")
    print(f"Std Dev:    {std_dev:.2f} (Target: ~70 - 90)")
    print(f"Min Score:  {min(scores)}")
    print(f"Max Score:  {max(scores)}")
    
    # 3. Monotonicity Analysis
    # Expected order: EXCELLENT -> GOOD -> FAIR -> POOR -> VERY_POOR
    band_order = ["EXCELLENT", "GOOD", "FAIR", "POOR", "VERY_POOR"]
    
    print("\n[Risk Band Stats (Monotonicity of Default Check)]")
    last_pd = -1.0
    monotonic = True
    for band in band_order:
        count = band_counts[band]
        pct = (count / n_profiles) * 100
        probs = band_probs[band]
        mean_pd = (sum(probs) / len(probs) * 100) if probs else 0.0
        
        # Check monotonicity: as risk band worsens, default probability must rise
        if last_pd != -1.0 and mean_pd < last_pd:
            monotonic = False
            status = "❌ VIOLATION"
        else:
            status = "✅ OK"
        last_pd = mean_pd
        
        print(f"Band: {band:<10} | Volume: {count:>4} ({pct:>5.2f}%) | Avg Default Rate: {mean_pd:>5.2f}% | Monotonicity: {status}")
        
    # 4. Kolmogorov-Smirnov (KS) Statistic Calculation
    # Let "goods" be applicants with PD < 0.20 and "bads" be applicants with PD >= 0.20
    goods = []
    bads = []
    for s, pd in zip(scores, default_probabilities):
        if pd < 0.20:
            goods.append(s)
        else:
            bads.append(s)
            
    goods.sort()
    bads.sort()
    
    # Compute Cumulative Distribution Functions (CDF) and find max difference
    max_diff = 0.0
    ks_cutoff = 0
    
    n_goods = len(goods)
    n_bads = len(bads)
    
    if n_goods > 0 and n_bads > 0:
        all_thresholds = sorted(list(set(scores)))
        for t in all_thresholds:
            cdf_goods = sum(1 for s in goods if s <= t) / n_goods
            cdf_bads = sum(1 for s in bads if s <= t) / n_bads
            diff = abs(cdf_goods - cdf_bads)
            if diff > max_diff:
                max_diff = diff
                ks_cutoff = t
                
    print("\n[KS Separation Power Analysis]")
    print(f"Good vs Bad Population Separation (KS): {max_diff:.4f} (Target: >0.40)")
    print(f"Optimal KS separation cutoff score:    {ks_cutoff}")
    
    return {
        "mean": mean_score,
        "std": std_dev,
        "ks": max_diff,
        "monotonic": monotonic
    }

if __name__ == "__main__":
    run_benchmark()
