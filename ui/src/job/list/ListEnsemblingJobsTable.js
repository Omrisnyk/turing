import React, { Fragment, useContext, useMemo } from "react";
import {
  EuiBadge,
  EuiCallOut,
  EuiHealth,
  EuiIcon,
  EuiBasicTable,
  EuiLink,
  EuiSearchBar,
  EuiSpacer,
  EuiText,
  EuiToolTip
} from "@elastic/eui";
import { appConfig } from "../../config";
import moment from "moment";
import { DeploymentStatusHealth } from "../../components/status_health/DeploymentStatusHealth";
import { JobStatus } from "../../services/job_status/JobStatus";
import EnsemblersContext from "../../providers/ensemblers/context";

const { defaultTextSize, defaultIconSize, dateFormat } = appConfig.tables;

export const ListEnsemblingJobsTable = ({
  items,
  totalItemCount,
  isLoaded,
  error,
  page,
  filter,
  onQueryChange,
  onPaginationChange,
  onRowClick
}) => {
  const ensemblers = useContext(EnsemblersContext);

  const searchQuery = useMemo(() => {
    const parts = [];
    if (!!filter.search) {
      parts.push(filter.search);
    }
    if (!!filter.ensembler_id) {
      parts.push(`ensembler_id:${filter.ensembler_id}`);
    }
    if (!!filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      parts.push(`status:(${statuses.join(" or ")})`);
    }

    return parts.join(" ");
  }, [filter]);

  const onTableChange = ({ page = {} }) => onPaginationChange(page);

  const columns = [
    {
      field: "id",
      name: "Id",
      width: "72px",
      render: (id, item) => (
        <EuiText size={defaultTextSize}>
          {id}
          {moment().diff(item.created_at, "hours") <= 1 && (
            <Fragment>
              &nbsp;
              <EuiBadge color="secondary">New</EuiBadge>
            </Fragment>
          )}
        </EuiText>
      )
    },
    {
      field: "name",
      name: "Name",
      width: "30%",
      render: name => (
        <span className="eui-textTruncate" title={name}>
          {name}
        </span>
      )
    },
    {
      field: "ensembler_id",
      name: "Ensembler",
      width: "20%",
      render: id =>
        !!ensemblers[id] ? (
          <EuiLink href={`./ensemblers/${id}`}>
            <EuiIcon type={"aggregate"} size={defaultIconSize} />
            {ensemblers[id].name}
          </EuiLink>
        ) : (
          "[Removed]"
        )
    },
    {
      field: "status",
      name: "Status",
      width: "20%",
      render: status => (
        <DeploymentStatusHealth status={JobStatus.fromValue(status)} />
      )
    },
    {
      field: "created_at",
      name: "Created",
      sortable: true,
      width: "20%",
      render: date => (
        <EuiToolTip
          position="top"
          content={moment(date, dateFormat).toLocaleString()}>
          <EuiText size={defaultTextSize}>
            {moment(date, dateFormat).fromNow()}
          </EuiText>
        </EuiToolTip>
      )
    },
    {
      field: "updated_at",
      name: "Updated",
      width: "20%",
      render: date => (
        <EuiToolTip
          position="top"
          content={moment(date, dateFormat).toLocaleString()}>
          <EuiText size={defaultTextSize}>
            {moment(date, dateFormat).fromNow()}
          </EuiText>
        </EuiToolTip>
      )
    }
  ];

  const pagination = {
    pageIndex: page.index,
    pageSize: page.size,
    totalItemCount
  };

  const search = {
    query: searchQuery,
    onChange: onQueryChange,
    box: {
      incremental: false
    },
    filters: [
      {
        type: "field_value_selection",
        field: "status",
        name: "Status",
        multiSelect: "or",
        options: JobStatus.values.map(status => ({
          value: status.toString(),
          view: <EuiHealth color={status.color}>{status.toString()}</EuiHealth>
        }))
      },
      {
        type: "field_value_selection",
        field: "ensembler_id",
        name: "Ensembler",
        multiSelect: false,
        options: Object.values(ensemblers).map(ensembler => ({
          value: ensembler.id,
          view: ensembler.name
        }))
      }
    ]
  };

  const cellProps = item =>
    onRowClick
      ? {
          style: { cursor: "pointer" },
          onClick: () => onRowClick(item)
        }
      : undefined;

  return error ? (
    <EuiCallOut
      title="Sorry, there was an error"
      color="danger"
      iconType="alert">
      <p>{error.message}</p>
    </EuiCallOut>
  ) : (
    <Fragment>
      <EuiSearchBar {...search} />
      <EuiSpacer size="l" />
      <EuiBasicTable
        items={items}
        loading={!isLoaded}
        columns={columns}
        cellProps={cellProps}
        pagination={pagination}
        onChange={onTableChange}
      />
    </Fragment>
  );
};
