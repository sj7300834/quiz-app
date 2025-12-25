const API_URL = "http://localhost:5000/api/questions";
const AUTH_API_URL = "http://localhost:5000/api/auth";

// Existing functions (fetchQuestions, addQuestion, deleteQuestion, saveQuizResult)
export const fetchQuestions = async (quizType) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');

        const response = await fetch(`${API_URL}/${quizType}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Unauthorized access. Please login again.');
            }
            throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }
};

export const addQuestion = async (questionData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(questionData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Unauthorized access. Please login again.');
            }
            throw new Error(`Failed to add question: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
};

export const deleteQuestion = async (questionId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');

        const response = await fetch(`${API_URL}/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Unauthorized access. Please login again.');
            }
            throw new Error(`Failed to delete question: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting question:", error);
        throw error;
    }
};

export const saveQuizResult = async (resultData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');

        const response = await fetch(`${API_URL}/save-result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify(resultData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Unauthorized access. Please login again.');
            }
            throw new Error(`Failed to save quiz result: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result; // Backend se result return karo (jo userName ke saath hai)
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }
};

// Updated Function: Upload Profile Picture
export const uploadProfilePicture = async (formData, token) => {
    try {
      if (!token) throw new Error('User is not authenticated');
  
      const response = await fetch(`${AUTH_API_URL}/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(data.message || `Failed to upload profile picture: ${response.statusText}`);
      }
  
      return data; // Returns { message, user } as per backend response
    } catch (error) {
      console.error("Error uploading profile picture:", error.message, error);
      throw error;
    }
};