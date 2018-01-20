using System.Text.RegularExpressions;

namespace QueryBuilder.Utils
{
    public class ValidationMethods
    {
        /// <summary>
        /// Метод валидации пароля. 
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public static bool PassValidation(string txt)
        {
            const string pass = @"^(?=.*\d)(?=.*[a-zA-Z0-9])(?=.*[A-Za-z0-9])(?!.*\s).*$";
            return Regex.IsMatch(txt, pass);
        }

        public static bool NameValidation(string txt)
        {
            const string pass = @"^([a-zA-Z0-9])*$";
            return Regex.IsMatch(txt, pass);
        }

        /// <summary>
        /// Метод валидации мыла.
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public static bool EmailValidation(string txt)
        {
            const string email = @"^([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]+@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z]{2,6}$";
            return Regex.IsMatch(txt, email);
        }
    }
}
