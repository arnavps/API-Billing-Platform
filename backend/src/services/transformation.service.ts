import vm from 'vm';

export class TransformationService {
  /**
   * Transforms a request or response object using provided JS code
   * Code should follow the format:
   * (input) => { 
   *   // transform logic
   *   return input; 
   * }
   */
  static async transform(input: any, code: string): Promise<any> {
    if (!code || code.trim() === '') return input;

    try {
      const script = new vm.Script(`(${code})(input)`);
      const context = vm.createContext({ input });
      
      // Execute with timeout and limited context
      const result = script.runInContext(context, { timeout: 100 });
      
      return result || input;
    } catch (error) {
      console.error('Transformation Error:', error);
      // Return original input on failure to avoid breaking the pipe
      return input;
    }
  }

  static async transformRequest(req: any, code: string): Promise<any> {
    return this.transform(req, code);
  }

  static async transformResponse(res: any, code: string): Promise<any> {
    return this.transform(res, code);
  }
}
