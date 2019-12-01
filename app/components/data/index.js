import moment from 'moment';
import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Container, Dropdown, Form, Icon, Label, Message, Segment } from 'semantic-ui-react';

import dataSources from 'actions/data-sources';
import { first } from 'helpers/chisels';
import { tr } from 'helpers/languages';
import messages from 'helpers/messages';
import { send } from 'helpers/requests';

class Data extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataSource: null,
      data: [ ]
    };
    this.INTERVAL = 10000;
    this.NUMBER_OF_VALUES = 100;
    autoBind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchDataSources();
    if (this.state.dataSource) {
      this.timer = setInterval(this.fetchData, this.INTERVAL);
      this.fetchData();
    }
  }

  componenWillUnmount() {
    // NOTE: The component never gets unmounted. So, there is definitely something I need to fix.
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  fetchDataSources() {
    // eslint-disable-next-line no-console
    console.log('Fetch the data sources.');
    send({
      url: `${ process.env.OPEN_API_FOR_ANALYTICS_BASE_URL }/data-sources/discover`,
      method: 'POST',
      data: { }
    }).then((response) => {
      const dataSources = response.data.dataSources;
      this.props.setDataSources(dataSources);
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch the data sources.', error);
      messages.error(`${ tr('FAILED_TO_FETCH_DATA_SOURCES') } ${ tr(error.message) }`);
    });
  }

  changeDataSource(key) {
    // The data source was not changed.
    if (!!this.state.dataSource && key === `${ this.state.dataSource.edgeGatewayReferenceID }.${ this.state.dataSource.id }`) {
      return;
    }
    const pieces = key.split('.');
    const dataSource = first(this.props.dataSources.filter((ds) => {
      return ds.edgeGatewayReferenceID === pieces[0] && ds.id === pieces[1];
    }));
    const noDataSourceBefore = dataSource && !this.state.dataSource;
    this.setState({ dataSource, data: [] }, () => {
      if (noDataSourceBefore) {
        this.timer = setInterval(this.fetchData, this.INTERVAL);
      }
    });
  }

  fetchData() {
    const dataSource = this.state.dataSource;
    if (!dataSource) {
      return;
    }
    // NOTE: This is what I need to fix.
    if (!this.container && this.timer) {
      clearInterval(this.timer);
    }
    // eslint-disable-next-line no-console
    console.log('Fetch the data.');
    const query = dataSource.edgeGatewayReferenceID ? `?edgeGatewayReferenceID=${ dataSource.edgeGatewayReferenceID }` :
      '';
    send({
      url: `${ process.env.OPEN_API_FOR_ANALYTICS_BASE_URL }/data-sources/${ dataSource.id }/data${ query }`,
      method: 'GET'
    }).then((response) => {
      // Nothing to show data to any more.
      if (!this.container) {
        return null;
      }
      const latest = this.state.data && this.state.data.length ?
        moment(this.state.data[this.state.data.length - 1].timestamp, 'YYYY-MM-DD HH:mm:ss') : null;
      const moreData = response.data.data.filter((d) => {
        return !latest || moment(d.timestamp, 'YYYY-MM-DD HH:mm:ss').isAfter(latest);
      });
      const data = [ ...this.state.data ].concat(moreData);
      while (data.length > this.NUMBER_OF_VALUES) {
        data.shift();
      }
      this.setState({ data });
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch the data.', error);
      messages.error(`${ tr('FAILED_TO_FETCH_DATA') } ${ tr(error.message) }`);
    });

  }

  render() {
    // eslint-disable-next-line no-console
    console.log('Render the data.');
    const dataSources = this.props.dataSources.map((ds) => {
      return { key: `${ ds.edgeGatewayReferenceID }.${ ds.id }`, text: ds.name, value: `${ ds.edgeGatewayReferenceID }.${ ds.id }` };
    });
    return (
      <Container className='data-from-source pretty-scroll'>
        <Form>
          <Form.Field inline>
            <label>{ tr('DATA_SOURCE') }</label>
            <Dropdown
              fluid
              selection
              name='dataSource'
              options={ dataSources }
              value={ this.state.dataSource ? `${ this.state.dataSource.edgeGatewayReferenceID }.${ this.state.dataSource.id }` : '' }
              onChange={
                (_e, data) => { this.changeDataSource(data.value); }
              }
            />
          </Form.Field>
        </Form>
        {
          this.state.dataSource ? (
            <div className='data pretty-scroll' ref={ (c) => { this.container = c; } }>
              {
                this.state.data.map((datum) => {
                  return (
                    <Segment className='datum' key={ datum.timestamp }>
                      <Label>
                        <Icon name='calendar' />
                        { datum.timestamp }
                      </Label>
                      { datum.value }
                    </Segment>
                  );
                })
              }
            </div>
          ) : (
            <Message>{ tr('NO_DATA') }</Message>
          )
        }
      </Container>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    language: state.settings.language,
    dataSources: state.dataSources.dataSources
  };
};

const mapDispatchToProps = (dispatch) => {
  const _dataSources = bindActionCreators(dataSources, dispatch);
  return {
    setDataSources: _dataSources.setDataSources
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Data);
