﻿// ------------------------------------------------------------------------------
//  <auto-generated>
//      This code was generated by coded UI test builder.
//      Version: 14.0.0.0
//
//      Changes to this file may cause incorrect behavior and will be lost if
//      the code is regenerated.
//  </auto-generated>
// ------------------------------------------------------------------------------

namespace CodedUITestProject1
{
    using System;
    using System.CodeDom.Compiler;
    using System.Collections.Generic;
    using System.Drawing;
    using System.Text.RegularExpressions;
    using System.Windows.Input;
    using Microsoft.VisualStudio.TestTools.UITest.Extension;
    using Microsoft.VisualStudio.TestTools.UITesting;
    using Microsoft.VisualStudio.TestTools.UITesting.WinControls;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using Keyboard = Microsoft.VisualStudio.TestTools.UITesting.Keyboard;
    using Mouse = Microsoft.VisualStudio.TestTools.UITesting.Mouse;
    using MouseButtons = System.Windows.Forms.MouseButtons;
    
    
    [GeneratedCode("Coded UITest Builder", "14.0.23107.0")]
    public partial class UIMap
    {
        
        /// <summary>
        /// RecordedMethod1 - Use 'RecordedMethod1Params' to pass parameters into this method.
        /// </summary>
        public void RecordedMethod1()
        {
            #region Variable Declarations
            WinControl uIChromeLegacyWindowDocument = this.UIHomePageQueryBuilderWindow.UIChromeLegacyWindowWindow.UIChromeLegacyWindowDocument;
            #endregion

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(179, 417));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(1189, 19));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(1189, 19));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(14, 22));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(14, 22));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(176, 254));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(163, 240));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(669, 359));

            // Type '{Back}' in 'Chrome Legacy Window' document
            Keyboard.SendKeys(uIChromeLegacyWindowDocument, this.RecordedMethod1Params.UIChromeLegacyWindowDocumentSendKeys, ModifierKeys.None);

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(754, 353));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(751, 594));

            // Click 'Chrome Legacy Window' document
            Mouse.Click(uIChromeLegacyWindowDocument, new Point(800, 293));
        }
        
        #region Properties
        public virtual RecordedMethod1Params RecordedMethod1Params
        {
            get
            {
                if ((this.mRecordedMethod1Params == null))
                {
                    this.mRecordedMethod1Params = new RecordedMethod1Params();
                }
                return this.mRecordedMethod1Params;
            }
        }
        
        public UIHomePageQueryBuilderWindow UIHomePageQueryBuilderWindow
        {
            get
            {
                if ((this.mUIHomePageQueryBuilderWindow == null))
                {
                    this.mUIHomePageQueryBuilderWindow = new UIHomePageQueryBuilderWindow();
                }
                return this.mUIHomePageQueryBuilderWindow;
            }
        }
        #endregion
        
        #region Fields
        private RecordedMethod1Params mRecordedMethod1Params;
        
        private UIHomePageQueryBuilderWindow mUIHomePageQueryBuilderWindow;
        #endregion
    }
    
    /// <summary>
    /// Parameters to be passed into 'RecordedMethod1'
    /// </summary>
    [GeneratedCode("Coded UITest Builder", "14.0.23107.0")]
    public class RecordedMethod1Params
    {
        
        #region Fields
        /// <summary>
        /// Type '{Back}' in 'Chrome Legacy Window' document
        /// </summary>
        public string UIChromeLegacyWindowDocumentSendKeys = "{Back}";
        #endregion
    }
    
    [GeneratedCode("Coded UITest Builder", "14.0.23107.0")]
    public class UIHomePageQueryBuilderWindow : WinWindow
    {
        
        public UIHomePageQueryBuilderWindow()
        {
            #region Search Criteria
            this.SearchProperties[WinWindow.PropertyNames.Name] = "Home Page - QueryBuilder - Google Chrome";
            this.SearchProperties[WinWindow.PropertyNames.ClassName] = "Chrome_WidgetWin_1";
            this.WindowTitles.Add("Home Page - QueryBuilder - Google Chrome");
            this.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List - Google Chrome");
            this.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List/3 - Google Chrome");
            #endregion
        }
        
        #region Properties
        public UIChromeLegacyWindowWindow UIChromeLegacyWindowWindow
        {
            get
            {
                if ((this.mUIChromeLegacyWindowWindow == null))
                {
                    this.mUIChromeLegacyWindowWindow = new UIChromeLegacyWindowWindow(this);
                }
                return this.mUIChromeLegacyWindowWindow;
            }
        }
        #endregion
        
        #region Fields
        private UIChromeLegacyWindowWindow mUIChromeLegacyWindowWindow;
        #endregion
    }
    
    [GeneratedCode("Coded UITest Builder", "14.0.23107.0")]
    public class UIChromeLegacyWindowWindow : WinWindow
    {
        
        public UIChromeLegacyWindowWindow(UITestControl searchLimitContainer) : 
                base(searchLimitContainer)
        {
            #region Search Criteria
            this.SearchProperties[WinWindow.PropertyNames.ControlId] = "381395280";
            this.WindowTitles.Add("Home Page - QueryBuilder - Google Chrome");
            this.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List - Google Chrome");
            this.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List/3 - Google Chrome");
            #endregion
        }
        
        #region Properties
        public WinControl UIChromeLegacyWindowDocument
        {
            get
            {
                if ((this.mUIChromeLegacyWindowDocument == null))
                {
                    this.mUIChromeLegacyWindowDocument = new WinControl(this);
                    #region Search Criteria
                    this.mUIChromeLegacyWindowDocument.SearchProperties[UITestControl.PropertyNames.ControlType] = "Document";
                    this.mUIChromeLegacyWindowDocument.WindowTitles.Add("Home Page - QueryBuilder - Google Chrome");
                    this.mUIChromeLegacyWindowDocument.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List - Google Chrome");
                    this.mUIChromeLegacyWindowDocument.WindowTitles.Add("https://query-builder.azurewebsites.net/Workflow/List/3 - Google Chrome");
                    #endregion
                }
                return this.mUIChromeLegacyWindowDocument;
            }
        }
        #endregion
        
        #region Fields
        private WinControl mUIChromeLegacyWindowDocument;
        #endregion
    }
}
