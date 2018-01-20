using System;
using System.Data;
using System.Data.SqlClient;

namespace QueryBuilder.Utils.DBSchema
{
    public class SqlExecuteData
    {
        public class SqlResultData
        {
            public DataTable ResultData { get; set; }

            public string ErrorText { get; set; }

            public bool HasError { get; set; }
        }

        public static SqlResultData SqlReturnDataFromQuery(string query, string connectionString)
        {
            var result = new SqlResultData();

            using (var conn = new SqlConnection(connectionString))
            {
                using (var cmd = new SqlCommand(query, conn)) 
                {
                    var adapt = new SqlDataAdapter(cmd);
                    conn.Open();
                    try
                    {
                        var table = new DataTable();
                        adapt.Fill(table);

                        result.ResultData = table;
                    }
                    catch (Exception ex)
                    {
                        result.HasError = true;
                        result.ErrorText = ex.Message;
                    }

                    conn.Close();
                }
            }

            return result;
        }
    }
}