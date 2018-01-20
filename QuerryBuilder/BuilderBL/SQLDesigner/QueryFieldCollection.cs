using BuilderBL.SQLDesigner.Enums;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Text;
using System.Collections.Specialized;

namespace BuilderBL.SQLDesigner
{
    /// <summary>
    /// Represents a bindable collection of <see cref="QueryField"/> objects.
    /// </summary>
    public class QueryFieldCollection : ObservableCollection<QueryField>
    {

        public QueryFieldCollection()
        {

        }
        /// <summary>
        /// Overridden to perform validation at list level.
        /// </summary>
        /// <param name="e"><see cref="ListChangedEventArgs"/> that contains the event data.</param>
       /* protected override void OnListChanged(ListChangedEventArgs e)
        {
            // fix fields when they change
            if (e.ListChangedType == ListChangedType.ItemChanged)
            {
                var f = this[e.NewIndex];
                switch (e.PropertyDescriptor.Name)
                {
                    // prevent duplicate aliases
                    case "Alias":
                        foreach (QueryField field in this)
                        {
                            if (field != f && f.Alias == field.Alias)
                            {
                                f.Alias = CreateUniqueAlias(f);
                                break;
                            }
                        }
                        break;

                    // if GroupBy is an aggregate, the field needs an alias
                    case "GroupBy":
                        if (f.GroupBy != Aggregate.GroupBy && string.IsNullOrEmpty(f.Alias))
                        {
                            f.Alias = CreateUniqueAlias(f);
                        }

                        break;
                }
            }

            // raise event as usual
            base.OnListChanged(e);
        }*/

        // creates a unique alias for a field
        string CreateUniqueAlias(QueryField f)
        {
            for (int i = 1; true; i++)
            {
                // try Expr1, Expr2, etc...
                string alias = string.Format("Expr{0}", i);

                // check if this one exists
                bool duplicate = false;
                foreach (QueryField field in this)
                {
                    if (field != f && string.Compare(alias, field.Alias, true) == 0)
                    {
                        duplicate = true;
                        break;
                    }
                }

                // doesn't exist? we're done here
                if (!duplicate)
                {
                    return alias;
                }
            }
        }
    }
}
