"""
FinGuard ML Training Script
============================
Trains a TF-IDF + Logistic Regression model on india_fraud_detection_FINAL.csv
and saves the artifacts to engine/models/.

Usage:
    cd d:/projects/bgkhack/backend
    python -m engine.train
"""

import os
import sys
import pathlib
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegressionCV
from sklearn.metrics import classification_report, accuracy_score

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = pathlib.Path(__file__).parent          # engine/
CSV_PATH   = BASE_DIR / "india_fraud_detection_FINAL.csv"
MODEL_DIR  = BASE_DIR / "models"
TFIDF_PATH = MODEL_DIR / "tfidf.pkl"
LR_PATH    = MODEL_DIR / "lr_model.pkl"


def train():
    print("=" * 60)
    print("  FinGuard ML Trainer — TF-IDF + Logistic Regression")
    print("=" * 60)

    # ── 1. Load dataset ───────────────────────────────────────────────────────
    if not CSV_PATH.exists():
        print(f"[ERROR] CSV not found at {CSV_PATH}")
        sys.exit(1)

    df = pd.read_csv(CSV_PATH)
    print(f"\n[DATA]  Loaded {len(df)} rows")

    # Verify required columns
    required = {"message_text", "label"}
    if not required.issubset(df.columns):
        print(f"[ERROR] CSV must have columns: {required}. Found: {list(df.columns)}")
        sys.exit(1)

    # ── 2. Preprocess ─────────────────────────────────────────────────────────
    df = df.dropna(subset=["message_text", "label"])
    df["message_text"] = df["message_text"].astype(str).str.lower().str.strip()
    df["label"] = df["label"].astype(int)

    X = df["message_text"].values
    y = df["label"].values

    print(f"[DATA]  Label distribution — Fraud(1): {y.sum()}  |  Legit(0): {(y==0).sum()}")

    # ── 3. Train / Test Split ─────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[SPLIT] Train: {len(X_train)}  |  Test: {len(X_test)}")

    # ── 4. TF-IDF Vectorizer ──────────────────────────────────────────────────
    print("\n[TRAIN] Fitting TF-IDF vectorizer …")
    tfidf = TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),       # unigrams + bigrams
        sublinear_tf=True,        # log(tf) scaling — helps for sparse text
        min_df=2,                 # ignore terms appearing in < 2 docs
        strip_accents="unicode",
    )
    X_train_vec = tfidf.fit_transform(X_train)
    X_test_vec  = tfidf.transform(X_test)
    print(f"[TRAIN] Vocabulary size: {len(tfidf.vocabulary_)}")

    # ── 5. Logistic Regression ────────────────────────────────────────────────
    print("[TRAIN] Training Logistic Regression (CV for C) …")
    lr = LogisticRegressionCV(
        Cs=10,
        cv=5,
        max_iter=1000,
        random_state=42,
        solver="saga",
        n_jobs=-1,
    )
    lr.fit(X_train_vec, y_train)
    print(f"[TRAIN] Best C: {lr.C_[0]:.4f}")

    # ── 6. Evaluate ───────────────────────────────────────────────────────────
    y_pred = lr.predict(X_test_vec)
    acc    = accuracy_score(y_test, y_pred)
    print(f"\n[EVAL]  Accuracy: {acc * 100:.2f}%")
    print("\n[EVAL]  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legit (0)", "Fraud (1)"]))

    # ── 7. Save artefacts ─────────────────────────────────────────────────────
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(tfidf, TFIDF_PATH)
    joblib.dump(lr, LR_PATH)
    print(f"[SAVE]  TF-IDF  -> {TFIDF_PATH}")
    print(f"[SAVE]  LR Model -> {LR_PATH}")
    print("\n  Training complete! Model is ready for inference.\n")


if __name__ == "__main__":
    train()
