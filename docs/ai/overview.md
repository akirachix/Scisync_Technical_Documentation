# Auditerra AI System: Technical Documentation

## 1. Overview

The Auditerra AI system is a **Retrieval-Augmented Generation (RAG)** component designed to provide agricultural decision support. It functions as an intelligent advisor that augments the expertise of field experts and provides easily digestible, actionable guidance to farmers.

The system is not a standalone predictive model but an integrated layer within the broader Auditerra platform, ingesting structured soil diagnostic data and returning context-aware technical reports and SMS summaries.

## Jupyter Notebook

> _Click below to view the end-to-end cleaning and preprocessing of dataset_

[**View the Notebook**]()

## 2. Models Used

### 2.1 Generative Model

The system utilizes a Google Gemini Flash model for text generation and reasoning. This model is responsible for synthesizing the retrieved agricultural context and structured soil data into two distinct, user-specific outputs.

### 2.2 Embedding Model

To enable semantic retrieval, the system uses the `gemini-embedding-2` model. This model converts the pre-processed agricultural reference documents into vector representations, allowing the system to understand and retrieve context relevant to specific soil measurements.

### 2.3 Knowledge Base Store

The agricultural reference information is indexed within a dedicated **Gemini File Search Store**. This acts as the system's "brain," containing pre-loaded, verified agricultural datasets, crop recommendations, and soil reference materials formatted as Markdown documents.

---

## 3. Training Approach

**Auditerra does not perform any custom model training or fine-tuning.**

Instead, it relies on **RAG (Retrieval-Augmented Generation)**:

- **Preparation:** Raw agricultural data (including crop yield, climate, soil, and environmental factors) is cleaned, processed, and verified to create a structured knowledge base.
- **Indexing:** This knowledge base is uploaded to the Gemini File Search Store.
- **Inference:** When a request is made, relevant chunks of the indexed knowledge base are retrieved dynamically and fed to the generative model alongside the specific diagnostic data.

This architecture allows the system to remain highly accurate and adaptable without the need for periodic retraining of the underlying AI model.

---

## 4. Data Pipeline

The flow of data from raw information to the final user output follows a highly structured pipeline:

```text
Raw Agricultural Datasets
        ↓
Data Processing & Verification
        ↓
Markdown Knowledge-Base Documents
        ↓
Gemini File Search Store (Embedding Index)
        ↓
FastAPI Backend (Input Assembly & Authorization)
        ↓
Gemini Model (Retrieval + Generation)
        ↓
Structured JSON Output Validation
        ↓
Distinct Delivery Channels (Expert vs. Farmer)
```

---

## 5. Integration with the Auditerra System

The AI component is deeply integrated into the backend's post-diagnostic workflow. It receives validated input from the core modules and delivers its outputs through distinct system channels.

### 5.1 Input & Authorization

The AI endpoint is strictly gated. Only authorized field experts with ownership of the specific diagnostic log can trigger the AI generation. The system extracts soil parameters (pH, N, P, K) and the issue category from the core application modules.

### 5.2 Data Anonymization

Before data leaves the trusted application zone, all personally identifiable information (PII) is strictly stripped. The AI only receives an anonymized agricultural zone ID, ensuring that no farmer names, phone numbers, or exact GPS coordinates are exposed to external AI services.

### 5.3 Output Generation & Validation

The model generates a strictly formatted JSON response containing two outputs:

- **Expert Report:** A comprehensive, ~350-word technical guide including Diagnosis, Severity, Remediation, Follow-up, and References.
- **Farmer SMS:** A simplified, actionable message limited to 160 characters, starting with "Hello farmer."

The backend validates this output against a strict schema. If the AI returns malformed data, the output is rejected, preventing corruption of the core system.

### 5.4 Delivery Channels

The AI outputs are dispatched through separate, established system channels:

1. **Farmer SMS:** The short, validated message is sent via the SMS Leopard gateway to the farmer's mobile phone.
2. **Expert Report:** The detailed technical report is dispatched via the configured expert webhook to the field expert's mobile application.

### 5.5 Auditability

Every generated recommendation is securely stored in PostgreSQL. The system records a SHA-256 hash of the input prompt, the output response, and the specific AI model version used. This creates a fully auditable, tamper-evident trail for every AI interaction, ensuring accountability.

---

## 6. Evaluation Method

The AI system is evaluated based on its **operational integrity and functionality** within the application, rather than standard predictive accuracy metrics.

The primary evaluations include:

- **Retrieval Functionality:** Verifying that the system correctly retrieves specific facts (e.g., crop counts, class data) from the indexed knowledge base.
- **Format Compliance:** Ensures the AI reliably returns valid JSON conforming to the system's strict schema.
- **Integration Stability:** Testing the end-to-end flow from input validation through to SMS and webhook delivery, ensuring data integrity across all system boundaries.

---

## 7. Accuracy Results

As a RAG-based generative system, there is **no formal classification accuracy percentage** (e.g., 95% accuracy) assigned to the model. The system's accuracy is inherently tied to the quality and comprehensiveness of the pre-indexed knowledge base. The documented results confirm that:

- The retrieval layer is fully functional.
- The generative model produces structured, valid outputs.
- The delivery mechanisms operate reliably.

---

## 8. Known Limitations

### 8.1 Knowledge-Base Dependency

The quality of the generated recommendations depends entirely on the quality and coverage of the uploaded agricultural reference documents. Gaps in the knowledge base can lead to suboptimal recommendations.

### 8.2 Generative Variability

As a generative model, it can produce slightly varying outputs given the same inputs. Auditerra mitigates this by setting a low temperature parameter (0.2) to enforce consistency.

### 8.3 Lack of Formal Diagnostic Benchmark

The system has not yet been evaluated against a strictly labeled, expert-validated test set. Therefore, its exact "real-world agronomic accuracy" is yet to be established.

### 8.4 SMS Length Constraint

The 160-character limitation on the farmer-facing SMS inherently restricts the depth of guidance that can be communicated to the end-user.

### 8.5 External Dependencies

The AI pipeline relies on external cloud APIs (Google Gemini) and communication gateways (SMS Leopard). A failure in these external services results in a "pending" or "failed" delivery state within the system.

### 8.6 Human Oversight

The AI acts strictly as a decision-support tool. The field expert remains completely responsible for interpreting the AI-generated report and making the final agronomic decisions.
