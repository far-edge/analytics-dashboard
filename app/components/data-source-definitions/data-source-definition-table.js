import React from 'react';
import ReactTable from 'react-table';
import { Button, Container, Icon, Segment } from 'semantic-ui-react';

import { first } from 'helpers/chisels';
import { tr } from 'helpers/languages';

const DataSourceDefinitionTable = (props) => {

  // eslint-disable-next-line no-console
  console.log('Render the data source definition table.');
  const columns = [{
    id: 'name',
    Header: tr('NAME'),
    accessor: 'name',
    className: 'c-name',
    headerClassName: 'h-name'
  }, {
    id: 'description',
    Header: tr('DESCRIPTION'),
    accessor: 'description',
    className: 'c-description',
    headerClassName: 'h-description'
  }, {
    id: 'data-interface',
    Header: tr('DATA_INTERFACE'),
    accessor: (dataSourceDefinition) => {
      const id = dataSourceDefinition.dataInterfaceReferenceID;
      return id ? first(props.dataInterfaces.filter((di) => { return di.id === id; })).name : '';
    },
    className: 'c-data-interface',
    headerClassName: 'h-data-interface'
  }, {
    id: 'data-kinds',
    Header: tr('DATA_KIND'),
    accessor: (dataSourceDefinition) => {
      const id = dataSourceDefinition.dataKindReferenceID;
      return id ? first(props.dataKinds.filter((dk) => { return dk.id === id; })).name : '';
    },
    className: 'c-data-kind',
    headerClassName: 'h-data-kind'
  }, {
    id: 'actions',
    Header: '',
    Cell: (row) => {
      const dataSourceDefinition = row.original;
      return (
        <Segment>
          <Button
            icon
            className='edit-data-source-definition'
            onClick={
              (_e) => {
                props.onEdit(dataSourceDefinition);
              }
            }
          >
            <Icon name='edit' />
          </Button>
          <Button
            icon
            className='delete-data-source-definition'
            onClick={
              (_e) => {
                props.onDelete(dataSourceDefinition);
              }
            }
          >
            <Icon name='delete' />
          </Button>
        </Segment>
      );
    },
    className: 'c-actions',
    headerClassName: 'h-actions',
    width: 85,
    sortable: false
  }];
  return (
    <Container>
      <ReactTable
        columns={ columns }
        data={ props.dataSourceDefinitions }
        minRows={ 0 }
        resizable={ false }
        showPagination={ false }
      />
    </Container>
  );

};

export default DataSourceDefinitionTable;
