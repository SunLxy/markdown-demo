
import React from "react"

  
      function baseDom4(){
        "use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }




var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = function _default() {
  return /*#__PURE__*/_react["default"].createElement("div", null, "222");
};

return _react["default"].createElement(_default)
      }

      function baseDom5(){
        "use strict";




var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = function _default() {
  return /*#__PURE__*/_react["default"].createElement("div", null, "21");
};

return _react["default"].createElement(_default)
      }


  const Code = (props) => {
  return <div>
    {props.children}
  </div>
}
  export default ()=>{
    return <React.Fragment>
    <h1>案例</h1> 
 <Code head={"测试标题"} value={"import {useState} from \"react\"\nimport React from \"react\"\nexport default ()=>{\n  return <div>222</div>\n}"} desc={"<p>展示内容区域32</p>\n<p>展示内容区域</p>"} >{baseDom4()}</Code> 
 <Code head={""} value={"export default ()=>{\n  return <div>21</div>\n}"} desc={""} >{baseDom5()}</Code> 
 <h2>测试标题3</h2> 
 
    </React.Fragment>
  }
  