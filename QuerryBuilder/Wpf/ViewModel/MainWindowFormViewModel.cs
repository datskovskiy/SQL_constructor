using BuilderBL;
using BuilderBL.SQLDesigner;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using QueryBuilder.DAL.Models;
using Wpf.DataModel;

namespace Wpf.ViewModel
{
    partial class MainWindowFormViewModel : Notifier
    {

        private bool _canExecute = false;

        private User _currentUser;
        private string _firstname;

		#region QueryBuilder
		private static BuilderBL.SQLDesigner.QueryBuilder _builder;
		private int _queryListSelectedIndex;


		public string SqlQuerry
		{
			get
			{
				return _builder?.Sql;
			}
		}

		public ObservableCollection<QueryField> QueryList
        {
            get {
				return _builder?.QueryFields;
			}
        }

		public int QueryListSelectedIndexyList
		{
			get { return _queryListSelectedIndex; } 
			set
			{
				_queryListSelectedIndex = value;
				OnPropertyChanged("QueryListSelectedIndexyList");
			}
		}

		public DataTable ResultTable { get; set; }


		public void AddField(object item)
        {
            var dataColumn = item as Entry;
            if (dataColumn != null)
            {
                AddColumn(_builder.DataTables[ dataColumn.Parent].Columns[dataColumn.Name]);
            }
            var dataTable = item as Group;
            if (dataTable != null && dataTable.SubGroups.Count == 0)
            {
                AddTable(_builder.DataTables[dataTable.Name]);
            }
        }
        void AddTable(DataTable dataTable)
        {
            var field = new QueryField(dataTable);
            _builder.QueryFields.Add(field);
            OnPropertyChanged("QueryList");
			OnPropertyChanged("SqlQuerry");
		}

        void AddColumn(DataColumn dc)
        {
            var field = new QueryField(dc);
            _builder.QueryFields.Add(field);
            OnPropertyChanged("QueryList");
			OnPropertyChanged("SqlQuerry");
		}


        #endregion
        public string FirstName
        {
            get { return _firstname; }
            set
            {
                _firstname = value;
                OnPropertyChanged("FirstName");
            }
        }


        public ObservableCollection<Group> List
        {
            get { return MainWindowData.UserConnections; }
            set
            {
                MainWindowData.UserConnections = value;
            }
        }

        public static void UpdateTable(string connString, string dbName)
        {
            var schema = new DbSchema(connString);
            _builder = new BuilderBL.SQLDesigner.QueryBuilder(schema);

			var newGroup = new Group { Name = dbName, SubGroups = new List<Group>(), Entries = new List<Entry>() };

            if (schema != null)
            {
                foreach (var dt in schema.GetTableEntities(schema))
                {
                    var temp = new Group { Name = dt.Key, SubGroups = new List<Group>(), Entries = new List<Entry>() };
                    foreach (var entry in dt.Value)
                    {
                        temp.Entries.Add(new Entry() { Name = entry, Parent = dt.Key });
                    }
                    newGroup.SubGroups.Add(temp);
                }
                MainWindowData.UserConnections.Add(newGroup);
            }
        }

        #region ICommand members


        public User CurrentUser
        {
            get
            {
                return _currentUser;
            }

            set
            {
                _currentUser = value;
                CanExecute = true;
            }
        }

        public bool CanExecute
        {
            get
            {
                return _canExecute;
            }

            set
            {
                _canExecute = value;
            }
        }

        private void EditProject_CommandExecute()
        {
        }
        #endregion
    }
}
