from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import models, schemas


def replace_variant_records(
    session: Session, task_id: int, sample_id: int, records: list[models.VariantRecord]
) -> list[models.VariantRecord]:
    session.execute(delete(models.VariantRecord).where(models.VariantRecord.task_id == task_id))
    for record in records:
        record.task_id = task_id
        record.sample_id = sample_id
        session.add(record)
    session.commit()
    return records


def list_variant_records(
    session: Session,
    task_id: int,
    query: schemas.ResultVariantQuery | None = None,
) -> list[models.VariantRecord]:
    statement = select(models.VariantRecord).where(models.VariantRecord.task_id == task_id)
    if query is not None:
        if query.chrom:
            statement = statement.where(models.VariantRecord.chrom == query.chrom)
        if query.sv_type:
            statement = statement.where(models.VariantRecord.sv_type == query.sv_type)
        if query.genotype:
            statement = statement.where(models.VariantRecord.gt == query.genotype)
        if query.min_length is not None:
            statement = statement.where(models.VariantRecord.sv_len >= query.min_length)
        if query.max_length is not None:
            statement = statement.where(models.VariantRecord.sv_len <= query.max_length)
        if query.min_support_reads is not None:
            statement = statement.where(
                models.VariantRecord.support_reads >= query.min_support_reads
            )
        if query.max_support_reads is not None:
            statement = statement.where(
                models.VariantRecord.support_reads <= query.max_support_reads
            )
        if query.start is not None:
            statement = statement.where(models.VariantRecord.pos >= query.start)
        if query.end is not None:
            statement = statement.where(models.VariantRecord.end <= query.end)

    sort_columns = {
        "pos": models.VariantRecord.pos,
        "end": models.VariantRecord.end,
        "sv_len": models.VariantRecord.sv_len,
        "support_reads": models.VariantRecord.support_reads,
        "sv_type": models.VariantRecord.sv_type,
        "chrom": models.VariantRecord.chrom,
    }
    sort_column = sort_columns.get(query.sort_by if query is not None else "pos", models.VariantRecord.pos)
    if query is not None and query.sort_order == "desc":
        statement = statement.order_by(sort_column.desc(), models.VariantRecord.id.desc())
    else:
        statement = statement.order_by(sort_column.asc(), models.VariantRecord.id.asc())

    if query is not None:
        statement = statement.offset(query.offset).limit(query.limit)
    return list(session.scalars(statement))


def get_variant_record(session: Session, variant_id: int) -> models.VariantRecord | None:
    return session.get(models.VariantRecord, variant_id)
