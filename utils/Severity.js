import AgeData from "./_age.js";
import SymptomData from "./_symptom.js";
import SpecializationData from "./_specialization.js";
import PastMedData from "./_pastMed.js";

function medHist(diseases) {
  let sum_data = 0;
  if (diseases.length === 0) return 0;
  for (const disease of diseases) {
    const diseaseRecord = PastMedData.find(
      (record) => record.Disease === disease
    );
    if (diseaseRecord) {
      sum_data += diseaseRecord.weight;
    }
  }
  return sum_data;
}

function currentSymptoms(symptoms) {
  let sum_weights = 0;
  if (symptoms.length === 0) return 0;
  for (const symptom of symptoms) {
    const symptomRecord = SymptomData.find(
      (record) => record.Symptom === symptom
    );
    if (symptomRecord) {
      sum_weights += symptomRecord.weight;
    }
  }
  return sum_weights;
}

function ageWeight(age) {
  const ageRecord = AgeData.find((record) => record.age === age);
  if (!ageRecord) return 0;
  return ageRecord.weight;
}

function lifestyleWeight(lifestyle) {
  if (lifestyle === "urban") return 4;
  else if (lifestyle === "rural") return 2;
  else if (lifestyle === "urban-rural") return 5;
  else if (lifestyle === "active") return 1;
  else return 0;
}

function smokingDrinking(habits) {
  if (habits === "yes") return 5;
  else if (habits === "no") return 1;
  else return 0;
}

function severity(age, symptoms, diseases, lifestyle, habits) {
  const severity_index =
    ageWeight(age) * 0.12 +
    currentSymptoms(symptoms) * 0.6 +
    medHist(diseases) * 0.12 +
    lifestyleWeight(lifestyle) * 0.08 +
    smokingDrinking(habits) * 0.08;
  return severity_index;
}

function highSeverity(symptoms, threshold = 4) {
  const highWeightCount = SymptomData.reduce((count, record) => {
    return (
      count +
      (symptoms.includes(record.Symptom) && record.weight >= threshold ? 1 : 0)
    );
  }, 0);
  return highWeightCount;
}

function findSpecialization(symptoms) {
  const spec = [];

  for (const symptom of symptoms) {
    try {
      const value = SpecializationData.find(
        (record) => record.Symptom === symptom
      )?.Specialization;
      spec.push(value);
    } catch (error) {
      return `Specialization for '${symptom}' not found`;
    }
  }

  if (!spec.length) {
    return "No valid symptoms provided";
  }

  return spec;
}

export { severity, highSeverity };
