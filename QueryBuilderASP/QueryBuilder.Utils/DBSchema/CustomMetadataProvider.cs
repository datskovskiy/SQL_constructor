using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Text;
using System.Xml.Linq;
using System.Linq;
using System;
using System.IO;

namespace QueryBuilder.Utils.DBSchema
{
	 public abstract class CustomMetadataProvider
	{
		const string TABLE = "BASE TABLE";
		const string VIEW = "VIEW";
		const string LINK = "LINK";
		const string TABLE_NAME = "TABLE_NAME";
		const string TABLE_TYPE = "TABLE_TYPE";
		const string TABLE_SCHEMA = "TABLE_SCHEMA";
		const string PROCEDURE_PARAMETERS = "PROCEDURE_PARAMETERS";

		//SELECT f.name AS ForeignKey, OBJECT_NAME(f.parent_object_id) AS TableName, COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName, OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName, COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferenceColumnName FROM sys.foreign_keys AS f INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id
		const string querry = "SELECT OBJECT_NAME(f.parent_object_id) AS TableName, COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName, OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName, COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferenceColumnName FROM sys.foreign_keys AS f INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id";
		const string querryPK = "select TABLE_NAME,COLUMN_NAME from INFORMATION_SCHEMA.KEY_COLUMN_USAGE where CONSTRAINT_NAME like 'PK%'";

		static Dictionary<string, string[]> datatypesConditions = new Dictionary<string, string[]>
		{
			//type_name = type size precision scale /// nullable 
			["bit"] = new string[]{ "Boolean", "1", "255", "255"},
			["bigint"] = new string[]{ "Int64", "8", "255", "255"},
			["binary"] = new string[]{ "Binary", "255", "255", "255"},
			["char"] = new string[]{ "String", "255", "255", "255" },
			["date"] = new string[]{ "DateTime", "255", "255", "255"},
			["datetime"] = new string[]{ "DateTime", "8", "23", "3" },
			["decimal"] = new string[]{ "Decimal", "8", "255", "255"},
			["float"] = new string[]{ "Double", "8", "255", "255"},
			["image"] = new string[]{ "Binary", "2147483647", "255", "255"},
			["int"] = new string[]{ "Int32", "4", "10", "255"},
			["money"] = new string[]{ "Decimal", "8", "19", "255"},
			["nchar"] = new string[]{ "String", "255", "255", "255" },
			["ntext"] = new string[]{ "String", "255", "255", "255" },
			["numeric"] = new string[]{ "Decimal", "8", "255", "255"},
			["nvarchar"] = new string[]{ "String", "255", "255", "255" },
			["real"] = new string[]{ "Single", "4", "24", "255" },
			["rowversion"] = new string[]{ "Binary", "255", "255", "255"},
			["smalldatetime"] = new string[]{ "DateTime", "8", "255", "255"},
			["smallint"] = new string[]{ "Int16", "2", "5", "255"},
			["smallmoney"] = new string[]{ "Decimal", "8", "255", "255"},
			["sql_variant"] = new string[]{ "Object", "255", "255", "255"},
			["text"] = new string[]{ "String", "255", "255", "255" },
			["time"] = new string[]{ "TimeSpan", "255", "255", "255"},
			["timestamp"] = new string[]{ "Binary", "255", "255", "255"},
			["tinyint"] = new string[]{ "Byte", "255", "255", "255"},
			["uniqueidentifier"] = new string[]{ "Guid", "255", "255", "255"},
			["varbinary"] = new string[]{ "Binary", "255", "255", "255"},
			["varchar"] = new string[]{ "String", "255", "255", "255" },
			["xml"] = new string[]{ "Xml", "255", "255", "255"}
		};


		public static Stream GetStream(SqlConnection[] connections)
		{
			MemoryStream stream = new MemoryStream();
			StreamWriter writer = new StreamWriter(stream);
			writer.Write(GetMetadata(connections));
			writer.Flush();
			stream.Position = 0;
			return stream;
		}
		public static string GetMetadata(SqlConnection[] connections)
		{
			XNamespace xsiNs = "http://www.activequerybuilder.com/schemas/metadata2.xsd";
			XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";
			var metadata = new XElement("metadata", new XAttribute(XNamespace.Xmlns +"xsi", xsi),new XAttribute(xsi+ "schemaLocation", xsiNs));
			
			foreach(var connection in connections)
			{
				var databaseElement = new XElement("database", new XAttribute("name", connection.Database), new XAttribute("default", "True"));
				metadata.Add(databaseElement);
				var shemaElement = new XElement("schema", new XAttribute("name", "dbo"), new XAttribute("default", "True"));
				databaseElement.Add(shemaElement);

				var nodesTable = new DataTable();
				var keyTable = new DataTable();
				var command = new SqlCommand(querry, connection);
				var keyCommand = new SqlCommand(querryPK, connection);

				connection.Open();
				var dataTables = connection.GetSchema("Tables", new string[4] { null, null, null, TABLE});
				var tablesColumns = connection.GetSchema("Columns");
				using (SqlDataReader dr = command.ExecuteReader())
				{
					nodesTable.Load(dr);
				}
				using (SqlDataReader dr = keyCommand.ExecuteReader())
				{
					keyTable.Load(dr);
				}

				connection.Close();


				foreach (DataRow dr in dataTables.Rows)
				{
					var tableName = (string)dr[TABLE_NAME];
					var tableElement = new XElement("table", new XAttribute("name", tableName));
					shemaElement.Add(tableElement);
					var keys = keyTable.AsEnumerable().Where(row => row.Field<string>(TABLE_NAME).Equals(tableName));

					foreach (DataRow drColumns in tablesColumns.AsEnumerable().Where(row => row.Field<string>(TABLE_NAME).Equals(tableName)))
					{
						var datatype = drColumns["DATA_TYPE"];
						var columnName = drColumns["COLUMN_NAME"].ToString();
						var name = new XAttribute("name", columnName);
						var type_name = new XAttribute("type_name", datatype);
						var type = new XAttribute("type", datatypesConditions[(string)datatype][0]);
						var sizetemp = drColumns["CHARACTER_MAXIMUM_LENGTH"].ToString();
						var size = new XAttribute("size", String.IsNullOrWhiteSpace(sizetemp) ? datatypesConditions[(string)datatype][1] : sizetemp);
						var precision = new XAttribute("precision", datatypesConditions[(string)datatype][2]);
						var scale = new XAttribute("scale", datatypesConditions[(string)datatype][3]);
						var nullable = new XAttribute("nullable", ((string)drColumns["IS_NULLABLE"]).Equals("YES") ? "True" : "False");
						var column = new XElement("field", name, type_name, type, size, precision, scale, nullable);
						foreach(DataRow drKeys in keys)
						{
							if (columnName.Equals(drKeys["COLUMN_NAME"]))
							{
								column.Add(new XAttribute("primary_key", "True"));
							}
						}

						tableElement.Add(column);

					}

					foreach (DataRow drColumns in nodesTable.AsEnumerable().Where(row => row.Field<string>("TableName").Equals(tableName)))
					{
						tableElement.Add(new XElement("foreignkey",
							new XElement("referenced_object",
								new XElement("name", drColumns["ReferenceTableName"].ToString()),
								new XElement("name", "dbo"),
								new XElement("name", connection.Database)),
							new XElement("referencing_field",
								new XAttribute("name", drColumns["ColumnName"].ToString()),
								new XAttribute("referenced_field", drColumns["ReferenceColumnName"].ToString())),
							new XElement("referencing_cardinality", "Many"),
							new XElement("referenced_cardinality", "One")
								));
					}
				}

			}
			
			var Result = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + metadata.ToString(SaveOptions.DisableFormatting);
			return Result;
			
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
