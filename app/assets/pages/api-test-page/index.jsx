import React from 'react';
import autobind from 'autobind-decorator';
import { Icon, Button, Input, Select, Modal } from 'antd';
import { connect } from 'dva';
import Mock from 'mockjs';
import { getEnvByUrl } from '../../utils/utils';

import Info from '../../components/info/index';
import Editor from '../../components/editor/index';
import AuthForm from './components/auth-form/index';
import MyTabs from './components/my-tabs/index';
import BulkEditor from '../../components/bulk-editor/index';
import Result from './components/result/index';

import './style.less';

const InputGroup = Input.Group;
window.Mock = Mock;

const BulkEditorEnvs = [{
  field: 'value',
  placeholder: '业务服务器地址',
  width: '70%',
}, {
  field: 'remark',
  placeholder: '备注',
  width: '30%',
}];

const BulkEditorGateway = [{
  field: 'value',
  placeholder: '网关服务器地址',
  width: '70%',
}, {
  field: 'remark',
  placeholder: '备注',
  width: '30%',
}];

@autobind
class Api extends React.PureComponent {
  state = {
    modalEnvs: [],
  }

  componentDidMount() {
    const { dispatch, params: { collectionId, apiId } } = this.props;
    dispatch({
      type: 'apiTestModel/detail',
      collectionId,
      apiId,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.apiId !== nextProps.params.apiId && nextProps.params.apiId) {
      this.props.dispatch({
        type: 'apiTestModel/detail',
        apiId: nextProps.params.apiId,
      });
    }
  }

  handleSendRequest() {
    this.props.dispatch({
      type: 'apiTestModel/sendRequest',
    });
  }

  handleSave() {
    const { apiTestModel } = this.props;
    const api = {
      _id: apiTestModel._id,
      params: apiTestModel.params,
      paramsIndex: apiTestModel.paramsIndex,
      requests: apiTestModel.requests,
      requestIndex: apiTestModel.requestIndex,
      headerIndex: apiTestModel.headerIndex,
      headers: apiTestModel.headers,
    };

    this.props.dispatch({
      type: 'collectionApisModel/saveAPI',
      api,
    });
  }

  handleMGWChange(value) {
    localStorage.setItem('pp_serverUrl', value);
    this.props.dispatch({
      type: 'apiTestModel/changeServerUrl',
      serverUrl: value,
    });
  }

  handleSpigwChange(value) {
    this.props.dispatch({
      type: 'apiTestModel/changeGateway',
      gateway: value,
    });
  }

  handleMethodChange(value) {
    this.props.dispatch({ type: 'apiTestModel/changeMethod', method: value });
  }

  handleEditorChange(type, list, selected) {
    this.props.dispatch({
      list,
      type: 'apiTestModel/changeEditor',
      changeType: type,
      index: typeof selected === 'number' ? selected : 0,
    });
  }

  handleChangeSubType(subType) {
    this.props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        subType,
      },
    });
  }

  toggleView() {
    const { apiTestModel } = this.props;
    this.props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        toggleView: !apiTestModel.toggleView,
      },
    });
  }

  toggleMockTips() {
    const { apiTestModel } = this.props;
    this.props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        toggleMockTips: !apiTestModel.toggleMockTips,
      },
    });
  }

  toggleEnvModal() {
    const { apiTestModel } = this.props;
    this.setState({
      modalEnvs: apiTestModel.envs,
    });
    this.props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        envModal: !apiTestModel.envModal,
      },
    });
  }

  toggleGatewayModal() {
    const { apiTestModel } = this.props;
    this.setState({
      modalEnvs: apiTestModel.gateways,
    });
    this.props.dispatch({
      type: 'apiTestModel/setData',
      data: {
        gatewayModal: !apiTestModel.gatewayModal,
      },
    });
  }

  handleUpdateEnvs() {
    // 根据当前是接口集还是系统池展示来区分更新什么
    const { apiTestModel, dispatch } = this.props;
    dispatch({
      type: 'apiTestModel/updateEnv',
      url: `/api/projects/${apiTestModel.projectId}`,
      envs: this.state.modalEnvs,
    });
  }

  handleUpdateGateways() {
    // 根据当前是接口集还是系统池展示来区分更新什么
    const { apiTestModel, dispatch } = this.props;
    dispatch({
      type: 'apiTestModel/updateGateway',
      url: `/api/projects/${apiTestModel.projectId}`,
      gateways: this.state.modalEnvs,
    });
  }

  getBelongQuery() {
    const { belong } = this.props.location.query;
    return belong || '';
  }

  getBelong() {
    let { belong } = this.props.location.query;
    const { projectId } = this.props.apiTestModel;
    belong = belong || `project_${projectId}`;
    return belong;
  }

  getUplevel() {
    return '/' + this.getBelong().replace('_', '/') + '?tab=api';
  }

  renderSPIView() {

  }

  render() {
    const { apiTestModel } = this.props;
    const { modalEnvs } = this.state;
    const { name, url, desc, apiType, gateways, result, isAuthing, displayUrl, method, gateway, gatewayModal, envModal, progress } = apiTestModel;
    const fullGateways = (gateways || []);
    const envs = apiTestModel.envs.filter(item => item) || [];

    return (
      <div>
        <div className="c-header">
          <Info title={name} url={url} desc={desc} apiType={apiType}>
            <Button size="default" className="new-btn" type="primary" icon="save" onClick={this.handleSave}>保存</Button>
          </Info>
        </div>
        <div className="api-content">
          <div className="test-panel-content">
            {
              apiType === 'SPI' || apiType === 'RPC' ? (
                <div className="actions">
                  <div className="path-input-wrapper">
                    <div className="path-input">
                      <InputGroup compact>
                        <div className="ant-select ant-select-enabled settings gateway">
                          网关服务器:
                        </div>
                        <Select size="default" style={{ flex: 'auto', width: 1 }} dropdownMatchSelectWidth={false} value={gateway} onChange={this.handleSpigwChange}>
                          <Select.Option value="">请选择服务器</Select.Option>
                          {
                            fullGateways.map(m => <Select.Option key={m} value={m.value}>{m.value}{m.remark && <span> ({m.remark}) </span>}</Select.Option>)
                          }
                        </Select>
                        <div className="ant-select ant-select-enabled settings" onClick={this.toggleGatewayModal}>
                          <Icon type="setting" className="icon-span" />
                        </div>
                      </InputGroup>
                    </div>
                    {
                      getEnvByUrl(gateway) === 'dev' && (
                        <div className="path-input">
                          <InputGroup compact>
                            <div className="ant-select ant-select-enabled settings gateway">
                              业务服务器:
                            </div>
                            <Select size="default" style={{ flex: 'auto', width: 1 }} dropdownMatchSelectWidth={false} value={apiTestModel.serverUrl} onChange={this.handleMGWChange}>
                              <Select.Option value="">请选择服务器</Select.Option>
                              {
                                envs.map(m => <Select.Option key={m} value={m.value}>{m.value}{m.remark && <span> ({m.remark}) </span>}</Select.Option>)
                              }
                            </Select>
                            <div className="ant-select ant-select-enabled settings" onClick={this.toggleEnvModal}>
                              <Icon type="setting" className="icon-span"/>
                            </div>
                          </InputGroup>
                        </div>
                      )
                    }
                  </div>
                  <div className="buttons">
                    <Button size="default" type="primary" icon="rocket" onClick={this.handleSendRequest}>
                      发送
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="actions">
                  <div className="path-input-wrapper">
                    <div className="path-input">
                      <InputGroup compact>
                        <Select size="default" defaultValue="POST" style={{ width: 80 }} value={apiTestModel.method} onChange={this.handleMethodChange}>
                          {
                            apiTestModel.methods.map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)
                          }
                        </Select>
                        <Select size="default" style={{ flex: 'auto', width: 1 }} dropdownMatchSelectWidth={false} value={apiTestModel.serverUrl} onChange={this.handleMGWChange}>
                          <Select.Option value="">请选择服务器</Select.Option>
                          {
                            envs.map(m => <Select.Option key={m} value={m.value}>{m.value}{m.remark && <span> ({m.remark}) </span>}</Select.Option>)
                          }
                        </Select>
                        <div className="ant-select ant-select-enabled settings" onClick={this.toggleEnvModal}>
                          <Icon type="setting" className="icon-span" />
                        </div>
                      </InputGroup>
                    </div>
                  </div>
                  <div className="buttons">
                    <Button size="default" type="primary" icon="rocket" onClick={this.handleSendRequest}>
                      发送
                    </Button>
                  </div>
                </div>
              )
            }

            <MyTabs activeKey={apiTestModel.subType} method={apiTestModel.method} onTabClick={this.handleChangeSubType} />

            <div className="main-content">
              {
                apiTestModel.subType === '2' && (
                  <Editor data={apiTestModel.requests} selected={apiTestModel.requestIndex} type="requests"
                          onChange={this.handleEditorChange} />
                )
              }
              {
                apiTestModel.subType === '3' && (
                  <AuthForm />
                )
              }
              {
                apiTestModel.subType === '1' && (
                  <Editor
                    mode="bulk"
                    type="params"
                    data={apiTestModel.params}
                    selected={apiTestModel.paramsIndex}
                    onChange={this.handleEditorChange}
                  />
                )
              }
              {
                apiTestModel.subType === '4' && (
                  <Editor data={apiTestModel.headers} mode="bulk" selected={apiTestModel.headerIndex} type="headers"
                          onChange={this.handleEditorChange} />
                )
              }
            </div>
          </div>

          <div className="api-result-panel">
            <Result apiTestModel={apiTestModel} progress={progress} method={method} url={displayUrl} result={result} isAuthing={isAuthing} />
          </div>
        </div>
        <Modal title="业务服务器配置" visible={envModal}
          onOk={this.handleUpdateEnvs}
          onCancel={this.toggleEnvModal}
        >
          <BulkEditor configs={BulkEditorEnvs} value={modalEnvs || []} onChange={ list => { this.setState({ modalEnvs: list }); } } />
        </Modal>
        <Modal title="网关服务器配置" visible={gatewayModal}
          onOk={this.handleUpdateGateways}
          onCancel={this.toggleGatewayModal}
        >
          <BulkEditor configs={BulkEditorGateway} value={modalEnvs || []} onChange={ list => { this.setState({ modalEnvs: list }); } } />
        </Modal>
      </div>
    );
  }
}

export default connect(({ collectionApisModel, apiTestModel }) => {
  return {
    collectionApisModel,
    apiTestModel,
  };
})(Api);
