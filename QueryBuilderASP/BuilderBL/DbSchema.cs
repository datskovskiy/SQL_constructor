using BuilderBL.SQLDesigner.Enums;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace BuilderBL
{
    public class DbSchema : DataSet
    {
        static string _connString = string.Empty;
        // <summary>
        // Обьявление полей для обозначения маркеров получаемых данных с бд
        // </summary>
        const string TABLE = "BASE TABLE";
        const string VIEW = "VIEW";
        const string LINK = "LINK";
        const string TABLE_NAME = "TABLE_NAME";
        const string TABLE_TYPE = "TABLE_TYPE";
        const string TABLE_SCHEMA = "TABLE_SCHEMA";
        const string PROCEDURE_PARAMETERS = "PROCEDURE_PARAMETERS";

        public DbSchema(string connString)
        {
            GetSchema(connString);
        }

        public DbSchema() { }

        public string ConnectionString
        {
            get
            {
                return _connString;
            }
            set
            {
                if (value != _connString)
                {
                    _connString = value;
                    GetSchema(_connString);
                }
            }
        }

        /// <summary>
        /// Получает выборку из таблици по имени
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public static string GetSelectStatement(DataTable table)
        {
            return string.Format("SELECT * from {0}", GetFullTableName(table));
        }

        public Dictionary<String, List<String>> GetTableEntities(DataSet allColumnsSchemaTable)
        {
            Dictionary<String, List<String>> _tables = new Dictionary<string, List<string>>();

            foreach (DataTable dt in allColumnsSchemaTable.Tables)
            {
                if (DbSchema.GetTableType(dt) == TableType.Table)
                {
                    _tables.Add(dt.TableName, AddDataColumns(dt));
                }
            }
            return _tables;
        }

        //public Dictionary<string, List<String>> GetViewEntities(DataTable allColumnsSchemaTable)
        //{
        //    throw new NotImplementedException();
        //}

        List<String> AddDataColumns(DataTable dt)
        {
            List<String> temp = new List<string>();
            foreach (DataColumn col in dt.Columns)
            {
                temp.Add(col.ColumnName);
            }
            return temp;
        }


        /// <summary>
        /// Определение типа(таблица или представление)
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public static TableType GetTableType(DataTable table)
        {
            switch (table.ExtendedProperties[TABLE_TYPE] as string)
            {
                case TABLE:
                    return TableType.Table;
                case LINK: break;
                case VIEW:
                    return TableType.View;
            }
            return TableType.Procedure;
        }

        /// <summary>
        /// Метод для получения полного имени таблици
        /// </summary>
        /// <param name="table"></param>
        /// <returns></returns>
        public static string GetFullTableName(DataTable table)
        {
            var sb = new StringBuilder();

            var schema = table.ExtendedProperties[TABLE_SCHEMA] as string;
            if (schema != null)
            {
                sb.AppendFormat("{0}.", schema);
            }

            sb.Append(BracketName(table.TableName));

            return sb.ToString();
        }

        /// <summary>
        /// Фильтрует полученые данные и формирует представление вида [dbo.Table]
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static string BracketName(string name)
        {
            if (name.Length > 1 && name[0] == '[' && name[name.Length - 1] == ']')
            {
                return name;
            }
            bool needsBrackets = false;
            if (!IsExpression(name))
            {
                for (int i = 0; i < name.Length && !needsBrackets; i++)
                {
                    char c = name[i];
                    needsBrackets = i == 0
                        ? !char.IsLetter(c)
                        : !char.IsLetterOrDigit(c) && c != '_';
                }
            }
            return needsBrackets
                ? string.Format("[{0}]", name)
                : name;
        }

        static char[] _expressionChars = "(),*".ToCharArray();

        static bool IsExpression(string name)
        {
            return name.IndexOfAny(_expressionChars) > -1;
        }
        /// <summary>
        /// Осуществлят соединение с бд
        /// </summary>
        /// <param name="connectionString"></param>
        void GetSchema(string connectionString)
        {
            this.Reset();

            EnforceConstraints = false;

            using (var conn = new SqlConnection(connectionString))
            {
				conn.Open();      // SqlExseption 
				GetTables(conn);
				conn.Close();
			}
        }
        /// <summary>
        /// Парсит схему таблиц для структурированного представления
        /// </summary>
        /// <param name="conn"></param>
        void GetTables(SqlConnection conn)
        {

            var dt = conn.GetSchema("Tables");
            foreach (DataRow dr in dt.Rows)
            {

                var type = (string)dr[TABLE_TYPE];
                if (type != TABLE && type != VIEW && type != LINK)
                {
                    continue;
                }

                var name = (string)dr[TABLE_NAME];
                var table = new DataTable(name);
                table.ExtendedProperties[TABLE_TYPE] = type;

                //foreach (DataColumn col in dt.Columns)
                //{
                //    table.ExtendedProperties[col.ColumnName] = dr[col];
                //}

                try
                {
                    var select = GetSelectStatement(table);
                    var da = new SqlDataAdapter(select, conn);
                    da.FillSchema(table, SchemaType.Mapped);
                    Tables.Add(table);                    
                }
                catch { }
            }
        }
    }
}
