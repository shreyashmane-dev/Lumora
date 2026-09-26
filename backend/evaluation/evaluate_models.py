import json
import os
import sys

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.services.detector import DetectorService


def run_evaluation():
    dataset_path = os.path.join(current_dir, "benchmark_dataset.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    total_samples = len(dataset)
    true_positives = 0
    false_positives = 0
    true_negatives = 0
    false_negatives = 0
    uncertain_count = 0

    human_samples = 0
    human_false_positives = 0

    results_by_length = {"short (<50w)": {"total": 0, "correct": 0}, "medium (>=50w)": {"total": 0, "correct": 0}}
    brier_scores = []

    print("=" * 65)
    print("LUMORA MODEL EVALUATION REPORT")
    print(f"Dataset: {dataset_path} ({total_samples} samples)")
    print("=" * 65)

    for item in dataset:
        text = item["text"]
        cat = item["category"]
        res = DetectorService.detect(text)
        prob = res.ai_probability
        pred = res.classification
        words = res.word_count

        length_bin = "short (<50w)" if words < 50 else "medium (>=50w)"
        results_by_length[length_bin]["total"] += 1

        if cat == "human":
            human_samples += 1
            # Ground truth: 0.0
            brier_scores.append((prob - 0.0) ** 2)
            if pred == "Likely AI-Generated":
                false_positives += 1
                human_false_positives += 1
            else:
                true_negatives += 1
                results_by_length[length_bin]["correct"] += 1
        elif cat == "ai":
            # Ground truth: 1.0
            brier_scores.append((prob - 1.0) ** 2)
            if pred == "Likely AI-Generated":
                true_positives += 1
                results_by_length[length_bin]["correct"] += 1
            elif pred == "Likely Human":
                false_negatives += 1
            else:
                uncertain_count += 1
        elif cat == "edited_ai":
            # Ground truth is ambiguous (mixed)
            if pred in ["Uncertain / Mixed", "Likely Human"]:
                results_by_length[length_bin]["correct"] += 1
            if pred == "Uncertain / Mixed":
                uncertain_count += 1

        print(f"[{item['id']}] {cat.upper():<10} -> {pred:<20} (Prob: {prob:.2f}, Conf: {res.confidence:.2f}, Words: {words})")

    # Metrics
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 1.0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 1.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = human_false_positives / human_samples if human_samples > 0 else 0.0
    fnr = false_negatives / 4.0  # 4 AI samples
    mean_brier = sum(brier_scores) / len(brier_scores) if brier_scores else 0.0

    print("\n" + "=" * 65)
    print("SUMMARY PERFORMANCE METRICS")
    print("=" * 65)
    print(f"Precision:                          {precision:.3f}")
    print(f"Recall:                             {recall:.3f}")
    print(f"F1 Score:                           {f1:.3f}")
    print(f"False-Positive Rate on Human Text:  {fpr:.1%} (Target: < 5%)")
    print(f"False-Negative Rate on AI Text:     {fnr:.1%}")
    print(f"Brier Calibration Error (lower=better): {mean_brier:.3f}")
    print(f"Uncertain / Mixed Classifications:  {uncertain_count}")
    print("-" * 65)
    for lbin, stats in results_by_length.items():
        acc = (stats["correct"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        print(f"Accuracy by Length [{lbin}]: {acc:.1f}% ({stats['correct']}/{stats['total']})")
    print("=" * 65)

    assert fpr == 0.0, f"False positive rate on human writing should be 0%, got {fpr}"
    assert f1 >= 0.85, f"F1 score should be >= 0.85, got {f1}"
    print("ALL EVALUATION CRITERIA MET.")


if __name__ == "__main__":
    run_evaluation()
