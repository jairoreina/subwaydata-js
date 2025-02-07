interface ErrorMessageProps {
    message: string;
    details?: {
      message?: string;
      pgError?: string;
      retryCount?: number;
      isSQLOnly?: boolean;
    } | null;
  }
  
  export function ErrorMessage({ message, details }: ErrorMessageProps) {
    // Helper function to get user-friendly message
    const getUserFriendlyMessage = () => {
      if (details?.isSQLOnly) {
        return "Make sure the SQL query is valid and relevant to the data and try again.";
      }
      return "Make sure your query is relevant to the MTA subway data and try again.";
    };

    return (
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">

          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800 mb-2 flex items-center"><svg className="h-6 w-6 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>There was an error processing your query</h3>
            <p className="text-base text-red-700 mb-3">
              {getUserFriendlyMessage()}
            </p>
            {details && (
              <div className="mt-2">
                {details.retryCount !== undefined && details.retryCount > 0 && (
                  <p className="text-sm text-red-600 mb-1">
                    We tried fixing this automatically {details.retryCount} {details.retryCount === 1 ? 'time' : 'times'}
                  </p>
                )}
                <div className="mt-2 p-3 bg-red-100 rounded text-sm text-red-800">
                  <p className="font-medium">Technical details:</p>
                  <p className="mt-1">{message}</p>
                  {details.pgError && (
                    <p className="mt-1 text-xs text-red-700">
                      Error code: {details.pgError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }