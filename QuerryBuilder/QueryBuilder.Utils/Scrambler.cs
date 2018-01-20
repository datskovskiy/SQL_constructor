using System;
using System.Security.Cryptography;
using System.Text;

namespace QueryBuilder.Utils
{
    public class Scrambler
    {
        public static Guid GetPassHash(string pass)
        {
            byte[] bytes = Encoding.Unicode.GetBytes(pass);
            MD5CryptoServiceProvider CSP = new MD5CryptoServiceProvider();

            byte[] byteHash = CSP.ComputeHash(bytes);

            string hash = string.Empty;

            foreach (byte b in byteHash)
                hash += string.Format("{0:x2}", b);

            return new Guid(hash);
        }
    }
}
