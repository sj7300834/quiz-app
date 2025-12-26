const BASE_URL = process.env.REACT_APP_API_URL;

/* =========================
   FETCH QUESTIONS
========================= */
export const fetchQuestions = async (quizType) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(
      `${BASE_URL}/api/questions/${quizType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Unauthorized access. Please login again.");
      }
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

/* =========================
   ADD QUESTION
========================= */
export const addQuestion = async (questionData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Unauthorized access. Please login again.");
      }
      throw new Error(`Failed to add question: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

/* =========================
   DELETE QUESTION
========================= */
export const deleteQuestion = async (questionId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(
      `${BASE_URL}/api/questions/${questionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Unauthorized access. Please login again.");
      }
      throw new Error(`Failed to delete question: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

/* =========================
   SAVE QUIZ RESULT
========================= */
export const saveQuizResult = async (resultData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(
      `${BASE_URL}/api/quiz/save-result`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Unauthorized access. Please login again.");
      }
      throw new Error(`Failed to save quiz result: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
};

/* =========================
   UPLOAD PROFILE PICTURE
========================= */
export const uploadProfilePicture = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(
      `${BASE_URL}/api/auth/upload-profile-picture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Unauthorized access. Please login again.");
      }
      throw new Error(
        data.message ||
          `Failed to upload profile picture: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};
