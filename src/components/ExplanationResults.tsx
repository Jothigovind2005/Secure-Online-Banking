import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  GitBranch, 
  Brain, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Lightbulb,
  Target
} from "lucide-react";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { cn } from "@/lib/utils";

interface ExplanationResultsProps {
  results: {
    explanation: string;
    diagram: string;
    trace: {
      input: string;
      steps: Array<{ line: number; vars: Record<string, any> }>;
    };
    quizzes: Array<{
      question: string;
      choices: string[];
      answer: string;
      hint: string;
      difficulty: string;
    }>;
  };
}

export const ExplanationResults = ({ results }: ExplanationResultsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!results.quizzes || results.quizzes.length === 0) return;
    
    if (currentQuestionIndex < results.quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score and show results
      const correct = selectedAnswers.reduce((acc, answer, index) => {
        const correctAnswerText = results.quizzes[index].answer;
        const selectedAnswerText = results.quizzes[index].choices[answer];
        return acc + (selectedAnswerText === correctAnswerText ? 1 : 0);
      }, 0);
      setQuizScore(correct);
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizScore(0);
  };

  // Handle case where no quizzes are available
  if (!results.quizzes || results.quizzes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="explanation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="explanation" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Explanation
            </TabsTrigger>
            <TabsTrigger value="diagram" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Flow Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explanation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Code Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Code Explanation:
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="leading-relaxed whitespace-pre-line">{results.explanation}</p>
                  </div>
                </div>

                {/* Execution Trace */}
                {results.trace && (
                  <div>
                    <h3 className="font-semibold mb-3">Execution Trace:</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Sample input: <code className="bg-muted px-2 py-1 rounded">{results.trace.input}</code>
                      </div>
                      <div className="space-y-2">
                        {results.trace.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <Badge variant="outline">Line {step.line}</Badge>
                            <div className="flex-1">
                              <span className="text-sm">Variables: </span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {JSON.stringify(step.vars, null, 2)}
                              </code>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagram" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Flow Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidDiagram chart={results.diagram} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  }

  const currentQuestion = results.quizzes[currentQuestionIndex];
  const totalQuestions = results.quizzes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explanation" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Explanation
          </TabsTrigger>
          <TabsTrigger value="diagram" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Flow Chart
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explanation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Code Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  Code Explanation:
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="leading-relaxed whitespace-pre-line">{results.explanation}</p>
                </div>
              </div>

              {/* Execution Trace */}
              {results.trace && (
                <div>
                  <h3 className="font-semibold mb-3">Execution Trace:</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Sample input: <code className="bg-muted px-2 py-1 rounded">{results.trace.input}</code>
                    </div>
                    <div className="space-y-2">
                      {results.trace.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <Badge variant="outline">Line {step.line}</Badge>
                          <div className="flex-1">
                            <span className="text-sm">Variables: </span>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {JSON.stringify(step.vars, null, 2)}
                            </code>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagram" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Flow Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <MermaidDiagram chart={results.diagram} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test Your Understanding</span>
                <Badge variant="outline">
                  {currentQuestionIndex + 1} of {totalQuestions}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div className="space-y-6">
                  {/* Progress */}
                  <Progress 
                    value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
                    className="w-full"
                  />

                  {/* Question */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {currentQuestion.question}
                    </h3>
                    
                    <div className="space-y-3">
                      {currentQuestion.choices.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={cn(
                            "w-full p-4 text-left rounded-lg border transition-all",
                            "hover:border-primary hover:bg-primary/5",
                            selectedAnswers[currentQuestionIndex] === index
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                              selectedAnswers[currentQuestionIndex] === index
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            )}>
                              {selectedAnswers[currentQuestionIndex] === index && (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    >
                      Previous
                    </Button>
                    
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="gradient-button"
                    >
                      {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Results */
                <div className="text-center space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {quizScore}/{totalQuestions}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {quizScore === totalQuestions ? "Perfect!" : 
                       quizScore >= totalQuestions * 0.7 ? "Great job!" :
                       "Keep learning!"}
                    </div>
                  </div>
                  
                  <Progress value={(quizScore / totalQuestions) * 100} className="w-full" />
                  
                  <Button onClick={resetQuiz} className="gradient-button">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};