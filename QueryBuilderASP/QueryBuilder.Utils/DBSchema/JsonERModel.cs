using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Text;

namespace QueryBuilder.Utils.DBSchema
{

	public class JsonERModel
	{
		const string TABLE = "BASE TABLE";
		const string VIEW = "VIEW";
		const string LINK = "LINK";
		const string TABLE_NAME = "TABLE_NAME";
		const string TABLE_TYPE = "TABLE_TYPE";
		const string TABLE_SCHEMA = "TABLE_SCHEMA";
		const string PROCEDURE_PARAMETERS = "PROCEDURE_PARAMETERS";

		public static string GetERModel(SqlConnection connection)
		{
			var shema = new List<dynamic>[2];
			shema[0] = new List<object>();
			shema[1] = new List<object>();
			connection.Open();
			var dataTables = connection.GetSchema("Tables");
			connection.Close();
			foreach (DataRow dr in dataTables.Rows)
			{

				var type = (string)dr[TABLE_TYPE];
				if (type != TABLE ) //(type != TABLE && type != VIEW && type != LINK)
				{
					continue;
				}

				var name = (string)dr[TABLE_NAME];

				dynamic table = new ExpandoObject();
				table.key = name;
				table.items = new List<object>();

				var datatable = new DataTable(name);
				datatable.ExtendedProperties[TABLE_TYPE] = type;

				try
				{
					connection.Open();
					var select = GetSelectStatement(datatable);
					var da = new SqlDataAdapter(select, connection);
					da.FillSchema(datatable, SchemaType.Mapped);
					connection.Close();
				}
				catch { }

				foreach (DataColumn column in datatable.Columns)
				{
					table.items.Add(new { name = column.ColumnName, datatype = column.DataType.Name });
				}

				shema[0].Add(table);
			}


			const string querry = "Select kcup.Table_name, kcuc.TABLE_NAME " +
								  "From INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc " +
								  "Left Join INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcup On " +
								  "rc.UNIQUE_CONSTRAINT_NAME = kcup.CONSTRAINT_NAME " +
								  "LEFT Join INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcuc on " +
								  "rc.CONSTRAINT_NAME = kcuc.CONSTRAINT_NAME and kcup.ORDINAL_POSITION = kcuc.ORDINAL_POSITION";

			var command = new SqlCommand(querry, connection);
			connection.Open();
			var nodesTable = new DataTable();
			using (SqlDataReader dr = command.ExecuteReader())
			{
				nodesTable.Load(dr);
			}

			dynamic nodes = new ExpandoObject();

			foreach (DataRow row in nodesTable.Rows)
			{
				shema[1].Add(new { from = row[1], to = row[0] });
			}
            
			return JsonConvert.SerializeObject(shema);
		}

		private static string GetSelectStatement(DataTable table)
		{
			return string.Format("SELECT * from {0}", GetFullTableName(table));
		}
		private static string GetFullTableName(DataTable table)
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

		private static string BracketName(string name)
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
		private static char[] _expressionChars = "(),*".ToCharArray();
		private static bool IsExpression(string name)
		{
			return name.IndexOfAny(_expressionChars) > -1;
		}
	}
}
