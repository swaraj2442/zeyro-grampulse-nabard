"""
Monte Carlo Shortfall Probability Engine.

For each forecast month, simulates n_simulations draws from a normal
distribution parameterised by (forecast_mean, std derived from P10/P90 band).
Shortfall probability = fraction of draws below the shortfall_threshold.
"""
import numpy as np
import pandas as pd


def compute_shortfall_probabilities(
    forecast_df: pd.DataFrame,
    n_simulations: int = 1000,
    shortfall_threshold: float = 0.0,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Compute per-month shortfall probabilities via Monte Carlo simulation.

    The standard deviation per month is inferred from the P10/P90 band:
        P10 = mean − 1.28 × σ  →  σ = band_width / (2 × 1.28)

    Args:
        forecast_df:          DataFrame with columns [period, forecast, lower_p10, upper_p90].
        n_simulations:        Number of Monte Carlo draws per month.
        shortfall_threshold:  Cashflow level considered a shortfall (default 0).
        seed:                 Random seed for reproducibility.

    Returns:
        forecast_df copy with added columns:
            shortfall_probability   — fraction of draws below threshold
            simulated_p10           — 10th percentile of simulated distribution
            simulated_p90           — 90th percentile of simulated distribution
            simulated_mean          — mean of simulated distribution
    """
    df = forecast_df.copy().reset_index(drop=True)

    # Infer σ from the P10/P90 band; clip to avoid degenerate zero-std
    band_width = df["upper_p90"] - df["lower_p10"]
    sigma = (band_width / (2.0 * 1.28)).clip(lower=1.0)

    rng = np.random.default_rng(seed=seed)

    shortfall_probs: list[float] = []
    sim_p10s: list[float] = []
    sim_p90s: list[float] = []
    sim_means: list[float] = []

    for idx in range(len(df)):
        draws = rng.normal(
            loc=float(df.loc[idx, "forecast"]),
            scale=float(sigma.iloc[idx]),
            size=n_simulations,
        )
        shortfall_probs.append(float((draws < shortfall_threshold).mean()))
        sim_p10s.append(float(np.percentile(draws, 10)))
        sim_p90s.append(float(np.percentile(draws, 90)))
        sim_means.append(float(draws.mean()))

    df["shortfall_probability"] = shortfall_probs
    df["simulated_p10"] = sim_p10s
    df["simulated_p90"] = sim_p90s
    df["simulated_mean"] = sim_means
    return df
