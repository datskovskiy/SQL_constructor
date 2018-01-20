using System;
using System.Windows.Input;

namespace Wpf.ViewModel.Command
{


    public class RelayCommand : ICommand
    {
        private readonly Action<object> _execute;
        private readonly Predicate<object> _canExecute;

        public RelayCommand(Action<object> execute) : this(execute, null)
        {
        }

        public RelayCommand(Action<object> execute, Predicate<object> canExecute)
        {
            if (execute == null)
                throw new ArgumentNullException("execute");
            _execute = execute;
            _canExecute = canExecute;
        }

        #region Члены ICommand

        public event EventHandler CanExecuteChanged
        {
            add
            {
                if (_canExecute != null)
                    CommandManager.RequerySuggested += value;
            }
            remove
            {
                if (_canExecute != null)
                    CommandManager.RequerySuggested -= value;
            }
        }

        public bool CanExecute(object parameter)
        {
            bool result = true;

            if (_canExecute != null)
            {
                result = _canExecute(parameter);
                CommandManager.InvalidateRequerySuggested();
            }
            return result;
        }

        public void Execute(object parameter)
        {
            _execute?.Invoke(parameter);
        }
        #endregion
    }
}
