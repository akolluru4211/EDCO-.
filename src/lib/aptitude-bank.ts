export interface AptitudeQuestion {
  id: string;
  category: "Quantitative" | "Logical Reasoning" | "Verbal" | "Technical";
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  difficulty: number;
}

export const APTITUDE_QUESTION_BANK: AptitudeQuestion[] = [
  {
    id: "q-1",
    category: "Quantitative",
    question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: [
      { id: "A", text: "120 metres" },
      { id: "B", text: "180 metres" },
      { id: "C", text: "150 metres" },
      { id: "D", text: "165 metres" }
    ],
    correctOptionId: "C",
    explanation: "Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres.",
    difficulty: 1
  },
  {
    id: "q-2",
    category: "Quantitative",
    question: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?",
    options: [
      { id: "A", text: "3.6 km/hr" },
      { id: "B", text: "7.2 km/hr" },
      { id: "C", text: "8.4 km/hr" },
      { id: "D", text: "10 km/hr" }
    ],
    correctOptionId: "B",
    explanation: "Speed = 600 / (5 * 60) = 2 m/sec. Converting to km/hr: 2 * (18/5) = 7.2 km/hr.",
    difficulty: 1
  },
  {
    id: "q-3",
    category: "Quantitative",
    question: "If A can do a piece of work in 10 days and B in 15 days, how long will they take working together?",
    options: [
      { id: "A", text: "5 days" },
      { id: "B", text: "6 days" },
      { id: "C", text: "8 days" },
      { id: "D", text: "9 days" }
    ],
    correctOptionId: "B",
    explanation: "1/A + 1/B = 1/10 + 1/15 = 5/30 = 1/6. Working together they take 6 days.",
    difficulty: 1
  },
  {
    id: "q-4",
    category: "Quantitative",
    question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
    options: [
      { id: "A", text: "Rs. 650" },
      { id: "B", text: "Rs. 690" },
      { id: "C", text: "Rs. 698" },
      { id: "D", text: "Rs. 700" }
    ],
    correctOptionId: "C",
    explanation: "Simple interest for 1 year = 854 - 815 = Rs. 39. SI for 3 years = 39 * 3 = 117. Principal = 815 - 117 = Rs. 698.",
    difficulty: 2
  },
  {
    id: "q-5",
    category: "Quantitative",
    question: "What is the probability of getting a sum 9 from two throws of a standard dice?",
    options: [
      { id: "A", text: "1/6" },
      { id: "B", text: "1/8" },
      { id: "C", text: "1/9" },
      { id: "D", text: "1/12" }
    ],
    correctOptionId: "C",
    explanation: "Favorable outcomes: (3,6), (4,5), (5,4), (6,3) = 4 outcomes. Total = 36. Probability = 4/36 = 1/9.",
    difficulty: 1
  },
  {
    id: "q-6",
    category: "Logical Reasoning",
    question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
    options: [
      { id: "A", text: "(1/3)" },
      { id: "B", text: "(1/8)" },
      { id: "C", text: "(2/8)" },
      { id: "D", text: "(1/16)" }
    ],
    correctOptionId: "B",
    explanation: "This is a simple division series; each number is one-half of the previous number: (1/4) / 2 = 1/8.",
    difficulty: 1
  },
  {
    id: "q-7",
    category: "Logical Reasoning",
    question: "SCD, TEF, UGH, ____, WKL. Which word completes the series?",
    options: [
      { id: "A", text: "CMN" },
      { id: "B", text: "UJI" },
      { id: "C", text: "VIJ" },
      { id: "D", text: "IJT" }
    ],
    correctOptionId: "C",
    explanation: "First letter progresses: S, T, U, V, W. Second and third letters are pairs: CD, EF, GH, IJ, KL. So VIJ.",
    difficulty: 1
  },
  {
    id: "q-8",
    category: "Logical Reasoning",
    question: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: [
      { id: "A", text: "Brother" },
      { id: "B", text: "Uncle" },
      { id: "C", text: "Cousin" },
      { id: "D", text: "Father" }
    ],
    correctOptionId: "D",
    explanation: "The only son of Suresh's mother is Suresh himself. So the boy in the photograph is Suresh's son. Suresh is his father.",
    difficulty: 1
  },
  {
    id: "q-9",
    category: "Verbal",
    question: "Choose the synonym for: TACITURN",
    options: [
      { id: "A", text: "Talkative" },
      { id: "B", text: "Reticent / Reserved" },
      { id: "C", text: "Aggressive" },
      { id: "D", text: "Clever" }
    ],
    correctOptionId: "B",
    explanation: "Taciturn means reserved or uncommunicative in speech, saying little.",
    difficulty: 2
  },
  {
    id: "q-10",
    category: "Verbal",
    question: "Find the correctly spelled word:",
    options: [
      { id: "A", text: "Accomodate" },
      { id: "B", text: "Accommodate" },
      { id: "C", text: "Acommodate" },
      { id: "D", text: "Accommodait" }
    ],
    correctOptionId: "B",
    explanation: "The correct spelling has double 'c' and double 'm': ACCOMMODATE.",
    difficulty: 1
  },
  {
    id: "q-11",
    category: "Technical",
    question: "What is the worst-case time complexity of QuickSort?",
    options: [
      { id: "A", text: "O(n log n)" },
      { id: "B", text: "O(n)" },
      { id: "C", text: "O(n^2)" },
      { id: "D", text: "O(log n)" }
    ],
    correctOptionId: "C",
    explanation: "When the selected pivot is always the extreme element, recursion depth is O(n), giving O(n^2).",
    difficulty: 2
  },
  {
    id: "q-12",
    category: "Technical",
    question: "In relational database design, what does the 'ACID' acronym stand for?",
    options: [
      { id: "A", text: "Atomicity, Consistency, Isolation, Durability" },
      { id: "B", text: "Accuracy, Concurrency, Integrity, Durability" },
      { id: "C", text: "Atomicity, Coherence, Independence, Distribution" },
      { id: "D", text: "Access, Control, Isolation, Distribution" }
    ],
    correctOptionId: "A",
    explanation: "ACID stands for Atomicity, Consistency, Isolation, Durability.",
    difficulty: 1
  }
];

export function getDailyQuestions(dateStr: string = new Date().toISOString().split("T")[0]): AptitudeQuestion[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const shuffled = [...APTITUDE_QUESTION_BANK].sort((a, b) => {
    const hashA = (positiveHash + a.id.charCodeAt(a.id.length - 1)) % 100;
    const hashB = (positiveHash + b.id.charCodeAt(b.id.length - 1)) % 100;
    return hashA - hashB;
  });

  return shuffled.slice(0, 10);
}
