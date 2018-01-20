using System;
using System.Data.SqlClient;

namespace Wpf
{
    class ConnectionDatabase
    {
        /// <summary>
        ///  Метод тестирующий подключение к БД. 
        /// </summary>
        /// <param name="stringConnect"></param>
        /// <returns></returns>
        public static bool TestConnectDb(string stringConnect)
        {
            try
            {
                SqlConnection connection = new SqlConnection { ConnectionString = stringConnect };
                connection.Open();
                if (connection.State.ToString() == "Open")
                {
                    connection.Close();
                    return true;
                }
                else
                {
                    return false;
                }

            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}