using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.ComponentModel;
using BuilderBL.SQLDesigner.Enums;
using System.Collections.Specialized;
using System.Collections.ObjectModel;

namespace BuilderBL.SQLDesigner
{


    /// <summary>
    /// Manages a collection of query fields and converts them into SQL statements.
    /// </summary>
    public class QueryBuilder
    {
		//----------------------------------------------------------------
		#region ** fields

		private ObservableCollection<QueryField> _queryFields;   // used to build query
		private DbSchema _schema;       // used to build query
		private string _sql;            // generated sql
		private int _tableCount;    // number of tables used
		private bool _missingJoins; // not all tables joined
		private bool _groupBy;      // add GROUP BY clause
		private int _top;           // top N records
		private bool _distinct;     // distinct records
		private GroupByExtension _gbExtension;  // cube/rollup/all

        #endregion

        //----------------------------------------------------------------
        #region Constructors

        /// <summary>
        /// Initializes a new instance of a <see cref="QueryBuilder"/>.
        /// </summary>
        /// <param name="schema"><see cref="OleDbSchema"/> used by the query builder.</param>
        public QueryBuilder(DbSchema schema)
        {
            _sql = null;
            _schema = schema;
            _queryFields = new QueryFieldCollection();
            _queryFields.CollectionChanged += _queryFields_ListChanged;
        }

        #endregion

        //----------------------------------------------------------------
        #region ** object model

        /// <summary>
        /// Gets or sets the connection string used by this <see cref="QueryBuilder"/>.
        /// </summary>
        public string ConnectionString
        {
            get { return _schema.ConnectionString; }
            set
            {
                if (_schema.ConnectionString != value)
                {
                    _schema.ConnectionString = value;
                    _sql = null;
                    QueryFields.Clear();
                }
            }
        }
        /// <summary>
        /// Gets the collection of <see cref="QueryField"/> objects that defines 
        /// the query.
        /// </summary>
        public ObservableCollection<QueryField> QueryFields
        {
            get { return _queryFields; }
        }
        /// <summary>
        /// Gets or sets a value that specifies whether the query groups the data.
        /// </summary>
		public bool GroupBy
        {
            get { return _groupBy; }
            set
            {
                if (_groupBy != value)
                {
                    _groupBy = value;
                    _sql = null;
                }
            }
        }
        /// <summary>
        /// Gets or sets a value that specifies how the query groups the data.
        /// </summary>
		public GroupByExtension GroupByExtension
        {
            get { return _gbExtension; }
            set
            {
                if (_gbExtension != value)
                {
                    _gbExtension = value;
                    _sql = null;
                }
            }
        }
        /// <summary>
        /// Gets or sets the number of records the query returns using a TOP clause.
        /// </summary>
		public int Top
        {
            get { return _top; }
            set
            {
                _top = value;
                _sql = null;
            }
        }
        /// <summary>
        /// Gets or sets whether the query should return DISTINCT values.
        /// </summary>
		public bool Distinct
        {
            get { return _distinct; }
            set
            {
                _distinct = value;
                _sql = null;
            }
        }
        /// <summary>
        /// Gets or sets the SQL string that represents the current <see cref="QueryFields"/>
        /// collection.
        /// </summary>
		public string Sql
        {
            get
            {
                if (_sql == null)
                {
                    BuildSqlStatement();
                }
                return _sql;
            }
        }
        /// <summary>
        /// Gets a value that indicates not all tables in the query are related.
        /// </summary>
        public bool MissingJoins
        {
            get { return _missingJoins; }
        }
        /// <summary>
        /// Gets or sets the schema that represents the underlying database.
        /// </summary>
        internal DbSchema Schema
        {
            get { return _schema; }
            //set { _schema = value; }
        }
        public DataTableCollection DataTables
        {
            get { return Schema.Tables; }
         
        }
        #endregion

        //----------------------------------------------------------------
        #region ** implementation

        // field list has changed, need to re-gen the SQL
        void _queryFields_ListChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
			BuildSqlStatement();
		}

		// build the SQL statement from the QueryFields collection.
		void BuildSqlStatement()
		{
			// sanity
			if (QueryFields.Count == 0 || _schema == null)
			{
				_tableCount = 0;
				_missingJoins = false;
				_sql = string.Empty;
				return;
			}

			// prepare to build sql statement
			StringBuilder sb = new StringBuilder();

			// select
			sb.Append("SELECT ");
            if (Distinct)
            {
                sb.Append("DISTINCT ");
            }
            if (Top > 0)
            {
                sb.AppendFormat("TOP {0} ", Top);
            }
            sb.Append("\r\n\t");
			sb.Append(BuildSelectClause());

			// from
            sb.AppendFormat("\r\nFROM\r\n\t{0}", BuildFromClause());

			// group by
			if (GroupBy)
			{
				string groupBy = BuildGroupByClause();
                if (groupBy.Length > 0)
                {
                    sb.AppendFormat("\r\nGROUP BY\r\n\t{0}", groupBy);
                }

				// having
				string having = BuildWhereClause();
				if (having.Length > 0)
				{
                    sb.AppendFormat("\r\nHAVING\r\n\t{0}", having);
				}
			}
			else
			{
				// where
				string where = BuildWhereClause();
				if (where.Length > 0)
				{
                    sb.AppendFormat("\r\nWHERE\r\n\t{0}", where);
				}
			}

			// order by
			string orderBy = BuildOrderByClause();
            if (orderBy.Length > 0)
            {
                sb.AppendFormat("\r\nORDER BY\r\n\t{0}", orderBy);
            }

			// done
			sb.Append(';');
			_sql = sb.ToString();
		}
        
        // build the SELECT clause
        string BuildSelectClause()
		{
			StringBuilder sb = new StringBuilder();
			foreach (QueryField field in QueryFields)
			{
				if (field.Output)
				{
					// add separator
                    if (sb.Length > 0)
                    {
                        sb.Append(",\r\n\t");
                    }

					// add field expression ("table.column" or "colexpr")
                    string item = field.GetFullName(GroupBy);
					sb.Append(item);

					// add alias (use brackets to contain spaces, reserved words, etc)
					if (!string.IsNullOrEmpty(field.Alias))
					{
                        sb.AppendFormat(" AS {0}", DbSchema.BracketName(field.Alias));
					}
				}
			}
			return sb.ToString();
		}

        // build the FROM clause
        string BuildFromClause()
		{
			// build list of tables in query
			var tables = new List<DataTable>();
			foreach (QueryField field in QueryFields)
			{
				string tableName = field.Table;
				DataTable table = _schema.Tables[tableName];
                if (table != null && !tables.Contains(table))
                {
                    tables.Add(table);
                }
			}

			// save table count so caller can check this
			_tableCount = tables.Count;

			// build list of joined tables so each table is related to the next one
			var qTables = new List<DataTable>();
			bool done = false;
			while (qTables.Count < tables.Count && !done)
			{
				done = true;
				foreach (DataTable dt in tables)
				{
					bool inserted = InsertRelatedTable(dt, qTables);
                    if (inserted)
                    {
                        done = false;
                    }
				}
			}

			// build join list
            var qJoins = new List<string>();
			for (int index = 0; index < qTables.Count - 1; index++)
			{
				// get relation
				DataTable dt1 = (DataTable)qTables[index];
				DataTable dt2 = (DataTable)qTables[index+1];
				DataRelation dr = GetRelation(dt1, dt2);

				// build join statement
				qJoins.Add(string.Format("{0}.{1} = {2}.{3}",
                    DbSchema.GetFullTableName(dr.ParentTable),
					dr.ParentColumns[0].ColumnName,
                    DbSchema.GetFullTableName(dr.ChildTable),
					dr.ChildColumns[0].ColumnName));
			}

			// build from statement
			StringBuilder sb = new StringBuilder();
			for (int i = 0; i < qTables.Count-1; i++)
			{
				DataTable dt = qTables[i] as DataTable;
                if (sb.Length > 0)
                {
                    sb.Append("\r\n\t");
                }
				sb.AppendFormat("({0} INNER JOIN", DbSchema.GetFullTableName(dt));
			}
			sb.AppendFormat(" {0}", DbSchema.GetFullTableName(qTables[qTables.Count-1])); //System.ArgumentOutOfRangeException
			for (int i = qJoins.Count-1; i >= 0; i--)
			{
				string join = qJoins[i] as string;
				sb.AppendFormat("\r\n\tON {0})", join);
			}

			// not all tables joined? probably not what the user wants...
			_missingJoins = qTables.Count < tables.Count;

			// add tables that couldn't be joined
			if (_missingJoins)
			{
				foreach (DataTable dt in tables)
				{
					if (!qTables.Contains(dt))
					{
						sb.AppendFormat(", {0}", DbSchema.GetFullTableName(dt));
						qTables.Add(dt);
					}
				}
			}

			// done
			return sb.ToString();
		}

		// insert a table into the list in a position such that the table is
		// related to the table before and after it; return true on success
        bool InsertRelatedTable(DataTable dt, List<DataTable> list)
		{
			// skip tables that have already been added
			if (list.Contains(dt))
			{
				return false;
			}

			// insert the first one
			if (list.Count == 0)
			{
				list.Add(dt);
				return true;
			}

			// look for a good insertion point
			for (int index = 0; index <= list.Count; index++)
			{
				// related to table before?
				bool before = index == 0 || GetRelation(dt, (DataTable)list[index-1]) != null;

				// related to table after?
				bool after  = index == list.Count || GetRelation(dt, (DataTable)list[index]) != null;

				// found a good insertion point, move on
				if (before && after)
				{
					list.Insert(index, dt);
					return true;
				}
			}

			// failed to insert
			return false;
		}

		// get the relation between two tables (or null if there's no relation)
		DataRelation GetRelation(DataTable dt1, DataTable dt2)
		{
			foreach (DataRelation dr in _schema.Relations)
			{
				if ((dr.ParentTable == dt1 && dr.ChildTable == dt2) ||
					(dr.ParentTable == dt2 && dr.ChildTable == dt1))
				{
					return dr;
				}
			}
			return null;
		}

        // build the WHERE clause
        string BuildWhereClause()
		{
			StringBuilder sb = new StringBuilder();
			foreach (QueryField field in QueryFields)
			{
				if (field.Filter.Length > 0)
				{
					// parse item
					string item = field.GetFilterExpression();
                    if (item.Length > 0)
                    {
                        // add separator
                        if (sb.Length > 0)
                        {
                            sb.Append(" AND\r\n\t");
                        }

                        // add item (e.g. 'x > y')
                        sb.Append(item);
                    }
				}
			}
			return sb.ToString();
		}

        // build the GROUPBY clause
        string BuildGroupByClause()
		{
			StringBuilder sb = new StringBuilder();
            if (GroupBy)
            {
                // GROUPBY fields
                foreach (QueryField field in QueryFields)
                {
                    if (field.GroupBy == Aggregate.GroupBy)
                    {
                        // add separator
                        if (sb.Length > 0)
                        {
                            sb.Append(",\r\n\t");
                        }

                        // add field expression ("table.column" or "colexpr")
                        string item = field.GetFullName();
                        sb.Append(item);
                    }
                }

                // extension
                switch (GroupByExtension)
                {
                    case GroupByExtension.All:
                        return "ALL " + sb.ToString();

                    case GroupByExtension.Cube:
                        sb.Append(" WITH CUBE");
                        break;

                    case GroupByExtension.Rollup:
                        sb.Append(" WITH ROLLUP");
                        break;
                }
            }

			// done
			return sb.ToString();
		}

        // build the ORDERBY clause
        string BuildOrderByClause()
		{
			StringBuilder sb = new StringBuilder();
			foreach (QueryField field in QueryFields)
			{
				if (field.Sort != Sort.NoSort)
				{
					// add separator
                    if (sb.Length > 0)
                    {
                        sb.Append(",\r\n\t");
                    }

					// add ORDER BY expression ("table.column" or "colexpr")
                    string item = field.GetFullName(true);
					sb.Append(item);

					// descending
                    if (field.Sort == Sort.Descending)
                    {
                        sb.Append(" DESC");
                    }
				}
			}
			return sb.ToString();
		}
		#endregion
	}
}
