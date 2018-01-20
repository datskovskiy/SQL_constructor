namespace QueryBuilder.Utils.Encryption
{
	using System;
	using System.IO;
	using System.Security.Cryptography;

	public class Rijndael
	{
		private static readonly byte[] _key = new byte[32] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 };
		private static readonly byte[] _iv = new byte[16] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

		public static byte[] EncryptStringToBytes(string plainText)
		{


			// Check arguments.
			if (plainText == null || plainText.Length <= 0)
				throw new ArgumentNullException("plainText");
			if (_key == null || _key.Length <= 0)
				throw new ArgumentNullException("_key");
			if (_iv == null || _iv.Length <= 0)
				throw new ArgumentNullException("_iv");
			byte[] encrypted;
			// Create an RijndaelManaged object
			// with the specified _key and _iv.
			using (RijndaelManaged rijAlg = new RijndaelManaged())
			{
				rijAlg.Key = _key;
				rijAlg.IV = _iv;

				// Create a decrytor to perform the stream transform.
				ICryptoTransform encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

				// Create the streams used for encryption.
				using (MemoryStream msEncrypt = new MemoryStream())
				{
					using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
					{
						using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
						{

							//Write all data to the stream.
							swEncrypt.Write(plainText);
						}
						encrypted = msEncrypt.ToArray();
					}
				}
			}


			// Return the encrypted bytes from the memory stream.
			return encrypted;

		}

		public static string DecryptStringFromBytes(byte[] cipherText)
		{

			// Check arguments.
			if (cipherText == null || cipherText.Length <= 0)
				throw new ArgumentNullException("cipherText");
			if (_key == null || _key.Length <= 0)
				throw new ArgumentNullException("_key");
			if (_iv == null || _iv.Length <= 0)
				throw new ArgumentNullException("_iv");

			// Declare the string used to hold
			// the decrypted text.
			string plaintext = null;

			// Create an RijndaelManaged object
			// with the specified _key and _iv.
			using (RijndaelManaged rijAlg = new RijndaelManaged())
			{
				rijAlg.Key = _key;
				rijAlg.IV = _iv;

				// Create a decrytor to perform the stream transform.
				ICryptoTransform decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);

				// Create the streams used for decryption.
				using (MemoryStream msDecrypt = new MemoryStream(cipherText))
				{
					using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
					{
						using (StreamReader srDecrypt = new StreamReader(csDecrypt))
						{

							// Read the decrypted bytes from the decrypting stream
							// and place them in a string.
							plaintext = srDecrypt.ReadToEnd();
						}
					}
				}

			}

			return plaintext;

		}
	}
}
